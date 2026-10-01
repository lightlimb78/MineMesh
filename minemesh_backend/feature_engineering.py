from collections import deque
from statistics import mean, stdev


class FeatureEngine:
    def __init__(self):
        self.history = {}

    def _get_history(self, node_id):
        if node_id not in self.history:
            self.history[node_id] = deque(maxlen=4)

        return self.history[node_id]

    def build_features(
        self,
        node_id: str,
        displacement: float,
        displacement_rate: float,
        temperature: float,
        latitude: float,
        longitude: float,
        precipitation_mm: float,
        distance_to_mine_km: float,
    ):
        history = self._get_history(node_id)

        # Previous measurements
        lag_1 = history[-1] if len(history) >= 1 else 0.0
        lag_2 = history[-2] if len(history) >= 2 else 0.0
        lag_3 = history[-3] if len(history) >= 3 else 0.0

        # Current deformation
        deformation = displacement

        # Change from previous reading
        deformation_change = (
            displacement - lag_1
            if len(history) >= 1
            else 0.0
        )

        # Last 3 values including current
        values = list(history)[-2:] + [displacement]

        rolling_mean_3 = mean(values)

        if len(values) >= 2:
            rolling_std_3 = stdev(values)
        else:
            rolling_std_3 = 0.0

        # Save current value AFTER calculating features
        history.append(displacement)

        return [
            latitude,
            longitude,
            deformation,
            lag_1,
            lag_2,
            lag_3,
            deformation_change,
            displacement_rate,
            rolling_mean_3,
            rolling_std_3,
            temperature,
            precipitation_mm,
            distance_to_mine_km,
        ]
