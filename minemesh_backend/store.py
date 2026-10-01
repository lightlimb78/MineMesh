# store.py

from collections import deque
from datetime import datetime, timezone
from math import sqrt
from threading import Lock


class Store:

    def __init__(self):

        self._lock = Lock()

        self._nodes = {}

        self._history = deque(
            maxlen=1000
        )

        self._deformation = deque(
            maxlen=1000
        )

        self._alerts = deque(
            maxlen=100
        )

        # Latest ML prediction per node
        self._predictions = {}

        self.last_update = None

    # ========================================================
    # TIME
    # ========================================================

    @staticmethod
    def now():

        return datetime.now(
            timezone.utc
        ).isoformat()

    # ========================================================
    # RISK LEVEL
    # ========================================================

    @staticmethod
    def risk_level(score):

        if score >= 70:
            return "Critical"

        if score >= 30:
            return "Warning"

        return "Normal"

    # ========================================================
    # UPDATE SENSOR
    # ========================================================

    def update(self, data):

        with self._lock:

            node_id = data["node_id"]

            timestamp = (
                data.get("timestamp")
                or self.now()
            )

            tilt_x = float(
                data.get("tilt_x") or 0
            )

            tilt_y = float(
                data.get("tilt_y") or 0
            )

            vibration = float(
                data.get("vibration") or 0
            )

            displacement = float(
                data.get("displacement") or 0
            )

            displacement_rate = float(
                data.get(
                    "displacement_rate"
                ) or 0
            )

            # ------------------------------------------------
            # Stage-A SENSOR SCORE
            # ------------------------------------------------

            tilt_score = min(
                100,
                sqrt(
                    tilt_x ** 2
                    +
                    tilt_y ** 2
                ) * 12
            )

            vibration_score = min(
                100,
                abs(vibration) * 10
            )

            displacement_score = min(
                100,
                abs(displacement)
            )

            rate_score = min(
                100,
                abs(displacement_rate) * 10
            )

            score = round(
                0.35 * displacement_score
                +
                0.25 * rate_score
                +
                0.20 * tilt_score
                +
                0.20 * vibration_score,
                1
            )

            # ------------------------------------------------
            # NODE
            # ------------------------------------------------

            node = {

                "id": node_id,

                "name":
                    f"Sensor Node {node_id}",

                "zone":
                    "Demo Zone",

                "status":
                    "online",

                # Stage A fallback score
                "risk":
                    score,

                "riskLevel":
                    self.risk_level(score),

                "lastSeen":
                    timestamp,

                "tiltX":
                    tilt_x,

                "tiltY":
                    tilt_y,

                "vibration":
                    vibration,

                "displacement":
                    displacement,

                "displacementRate":
                    displacement_rate,

                "temperature":
                    data.get(
                        "temperature"
                    ),

                "humidity":
                    data.get(
                        "humidity"
                    ),

                "battery":
                    data.get(
                        "battery",
                        0
                    ),

                "signal":
                    data.get(
                        "rssi",
                        0
                    ),

                "snr":
                    data.get(
                        "snr"
                    ),
            }

            self._nodes[node_id] = node

            # ------------------------------------------------
            # HISTORY
            # ------------------------------------------------

            self._history.append({
                **data,
                "received_at":
                    timestamp
            })

            # ------------------------------------------------
            # DEFORMATION GRAPH
            # ------------------------------------------------

            self._deformation.append({

                "label":
                    timestamp,

                "value":
                    displacement
            })

            self.last_update = timestamp

            # ------------------------------------------------
            # STAGE A ALERTS
            # ------------------------------------------------

            if score >= 70:

                self._add_alert(
                    node_id,
                    "Critical deformation risk detected",
                    "Critical",
                    timestamp
                )

            elif score >= 30:

                if not self._has_recent_warning(
                    node_id
                ):

                    self._add_alert(
                        node_id,
                        "Elevated ground movement detected",
                        "Warning",
                        timestamp
                    )

    # ========================================================
    # ML PREDICTION
    # ========================================================

    def set_prediction(
        self,
        node_id,
        prediction,
        features
    ):

        with self._lock:

            self._predictions[node_id] = {

                "node_id":
                    node_id,

                "predicted_future_deformation":
                    prediction,

                "features":
                    features,

                "timestamp":
                    self.now(),

                "ml_ready":
                    True,
            }

    # ========================================================
    # ALERT
    # ========================================================

    def _add_alert(
        self,
        node_id,
        message,
        level,
        timestamp
    ):

        self._alerts.appendleft({

            "id":
                f"A{len(self._alerts) + 1:04d}",

            "nodeId":
                node_id,

            "message":
                message,

            "level":
                level,

            "time":
                timestamp,

            "resolved":
                False
        })

    # ========================================================
    # WARNING CHECK
    # ========================================================

    def _has_recent_warning(
        self,
        node_id
    ):

        for alert in list(
            self._alerts
        )[:10]:

            if (
                alert["nodeId"]
                == node_id

                and

                alert["level"]
                == "Warning"

                and

                not alert["resolved"]
            ):

                return True

        return False

    # ========================================================
    # GET NODES
    # ========================================================

    def nodes(self):

        with self._lock:

            return list(
                self._nodes.values()
            )

    # ========================================================
    # GET NODE
    # ========================================================

    def get_node(
        self,
        node_id
    ):

        with self._lock:

            return self._nodes.get(
                node_id
            )

    # ========================================================
    # ALERTS
    # ========================================================

    def alerts(self):

        with self._lock:

            return list(
                self._alerts
            )

    # ========================================================
    # DEFORMATION
    # ========================================================

    def deformation(self):

        with self._lock:

            return list(
                self._deformation
            )

    # ========================================================
    # LATEST PREDICTION
    # ========================================================

    def prediction(self):

        with self._lock:

            if not self._predictions:

                return {
                    "ml_ready":
                        False,

                    "predicted_future_deformation":
                        None,

                    "message":
                        "Waiting for enough temporal sensor data."
                }

            # Return latest prediction
            latest = list(
                self._predictions.values()
            )[-1]

            return latest

    # ========================================================
    # SYSTEM STATUS
    # ========================================================

    def system_status(self):

        with self._lock:

            return {

                "gateway":
                    "online",

                "aiEngine":
                    "online",

                "mesh":
                    (
                        "healthy"
                        if self._nodes
                        else "waiting"
                    ),

                "lastUpdate":
                    self.last_update
            }

    # ========================================================
    # RAW DATA
    # ========================================================

    def raw_data(self):

        with self._lock:

            return list(
                self._history
            )


store = Store()
