# ml_features.py

from collections import deque
from math import sqrt
from threading import Lock

from config import (
    NODE_CONFIG,
    DEFAULT_PRECIPITATION_MM,
)


FEATURES = [
    "latitude",
    "longitude",

    "deformation",
    "deformation_lag_1",
    "deformation_lag_2",
    "deformation_lag_3",

    "deformation_change",
    "deformation_rate",

    "rolling_mean_3",
    "rolling_std_3",

    "temperature_C",
    "precipitation_mm",

    "distance_to_mine_km",
]


class TemporalFeatureEngine:

    def __init__(self):
        self._lock = Lock()

        # History is maintained independently for every node.
        #
        # Each item:
        # {
        #     "timestamp": ...,
        #     "deformation": ...
        # }
        self._history = {}

    # --------------------------------------------------------
    # ADD READING
    # --------------------------------------------------------

    def add_reading(self, data):
        node_id = data["node_id"]

        with self._lock:

            if node_id not in self._history:
                self._history[node_id] = deque(
                    maxlen=1000
                )

            history = self._history[node_id]

            current = {
                "timestamp": data.get("timestamp"),
                "deformation": float(
                    data.get("displacement", 0.0)
                ),
                "temperature": float(
                    data.get("temperature", 0.0)
                ),
            }

            history.append(current)

            return self._create_features(
                data,
                history
            )

    # --------------------------------------------------------
    # CREATE FEATURES
    # --------------------------------------------------------

    def _create_features(self, data, history):

        node_id = data["node_id"]

        node_config = NODE_CONFIG.get(
            node_id
        )

        if node_config is None:
            raise ValueError(
                f"No ML configuration found for node '{node_id}'"
            )

        # ----------------------------------------------------
        # Need current + previous 3 readings
        # ----------------------------------------------------

        if len(history) < 4:
            return None

        current = history[-1]

        lag_1 = history[-2]
        lag_2 = history[-3]
        lag_3 = history[-4]

        deformation = current["deformation"]

        deformation_lag_1 = (
            lag_1["deformation"]
        )

        deformation_lag_2 = (
            lag_2["deformation"]
        )

        deformation_lag_3 = (
            lag_3["deformation"]
        )

        # ----------------------------------------------------
        # DEFORMATION CHANGE
        # ----------------------------------------------------

        deformation_change = (
            deformation
            - deformation_lag_1
        )

        # ----------------------------------------------------
        # TIME DIFFERENCE
        # ----------------------------------------------------

        deformation_rate = self._calculate_rate(
            current,
            lag_1,
            deformation_change
        )

        # ----------------------------------------------------
        # ROLLING 3
        # ----------------------------------------------------

        rolling_values = [
            lag_2["deformation"],
            lag_1["deformation"],
            deformation,
        ]

        rolling_mean_3 = (
            sum(rolling_values)
            / len(rolling_values)
        )

        rolling_std_3 = self._sample_std(
            rolling_values
        )

        # ----------------------------------------------------
        # OTHER FEATURES
        # ----------------------------------------------------

        features = {
            "latitude": float(
                node_config["latitude"]
            ),

            "longitude": float(
                node_config["longitude"]
            ),

            "deformation": deformation,

            "deformation_lag_1":
                deformation_lag_1,

            "deformation_lag_2":
                deformation_lag_2,

            "deformation_lag_3":
                deformation_lag_3,

            "deformation_change":
                deformation_change,

            "deformation_rate":
                deformation_rate,

            "rolling_mean_3":
                rolling_mean_3,

            "rolling_std_3":
                rolling_std_3,

            "temperature_C":
                current["temperature"],

            "precipitation_mm":
                float(
                    data.get(
                        "precipitation_mm",
                        DEFAULT_PRECIPITATION_MM
                    )
                ),

            "distance_to_mine_km":
                float(
                    node_config[
                        "distance_to_mine_km"
                    ]
                ),
        }

        return features

    # --------------------------------------------------------
    # RATE
    # --------------------------------------------------------

    @staticmethod
    def _calculate_rate(
        current,
        previous,
        deformation_change
    ):

        current_time = current["timestamp"]
        previous_time = previous["timestamp"]

        if not current_time or not previous_time:
            return 0.0

        try:
            delta_seconds = (
                current_time - previous_time
            ).total_seconds()

        except AttributeError:
            return 0.0

        if delta_seconds <= 0:
            return 0.0

        days = (
            delta_seconds / 86400.0
        )

        return deformation_change / days

    # --------------------------------------------------------
    # SAMPLE STANDARD DEVIATION
    # --------------------------------------------------------

    @staticmethod
    def _sample_std(values):

        n = len(values)

        if n < 2:
            return 0.0

        mean = sum(values) / n

        variance = sum(
            (x - mean) ** 2
            for x in values
        ) / (n - 1)

        return sqrt(variance)


feature_engine = TemporalFeatureEngine()
