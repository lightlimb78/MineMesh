# main.py

from datetime import datetime

from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from pydantic import BaseModel

from store import store

from ml_features import (
    feature_engine
)

from model import (
    deformation_model
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(

    title=
        "MineGuard IoT + ML Backend",

    version=
        "2.0.0",

    description=
        "ESP32 -> FastAPI -> Temporal Features -> XGBoost"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# SENSOR DATA MODEL
# ============================================================

class SensorData(BaseModel):

    node_id: str

    sequence: int

    tilt_x: float

    tilt_y: float

    acceleration: float

    vibration: float

    displacement: float

    displacement_rate: float

    temperature: float

    humidity: float


# ============================================================
# INGEST
# ============================================================

def ingest(data: SensorData):

    payload = data.model_dump()
    payload["timestamp"] = datetime.now()
    # --------------------------------------------------------
    # Store raw sensor data
    # --------------------------------------------------------

    store.update(
        payload
    )

    # --------------------------------------------------------
    # Add temporal history and create ML features
    # --------------------------------------------------------

    try:

        features = (
            feature_engine.add_reading(
                payload
            )
        )

    except ValueError as e:

        print(
            f"ML feature error: {e}"
        )

        return payload

    # --------------------------------------------------------
    # Not enough history yet
    # --------------------------------------------------------

    if features is None:

        print(
            f"[ML] Node {data.node_id}: "
            f"waiting for temporal history"
        )

        return payload

    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    try:

        prediction = (
            deformation_model.predict(
                features
            )
        )

        store.set_prediction(

            data.node_id,

            prediction,

            features
        )

        print(
            f"[ML] Node {data.node_id}: "
            f"future deformation = "
            f"{prediction:.6f}"
        )

    except Exception as e:

        print(
            f"[ML] Prediction failed: {e}"
        )

    return payload


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "service":
            "MineGuard IoT + ML Backend",

        "stage":
            "B",

        "ai":
            True,

        "model":
            "XGBoost temporal deformation",

        "target":
            "future_deformation",

        "status":
            "online"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {

        "status":
            "ok",

        "stage":
            "B",

        "gateway":
            "waiting for ESP32",

        "ai":
            "online",

        "model":
            "loaded",

        "last_sensor_update":
            store.last_update
    }


# ============================================================
# SENSOR DATA
# ============================================================

@app.post(
    "/api/sensor-data"
)
def receive_sensor_data(
    data: SensorData
):

    ingest(data)

    return {

        "ok":
            True,

        "message":
            "Sensor data accepted",

        "node_id":
            data.node_id,

        "sequence":
            data.sequence
    }


# ============================================================
# NODES
# ============================================================

@app.get(
    "/api/nodes"
)
def get_nodes():

    return store.nodes()


@app.get(
    "/api/nodes/{node_id}"
)
def get_node(
    node_id: str
):

    node = store.get_node(
        node_id
    )

    if not node:

        raise HTTPException(
            status_code=404,

            detail=
                "Node not found"
        )

    return node


# ============================================================
# ALERTS
# ============================================================

@app.get(
    "/api/alerts"
)
def get_alerts():

    return store.alerts()


# ============================================================
# DEFORMATION TREND
# ============================================================

@app.get(
    "/api/trends/deformation"
)
def get_deformation():

    return store.deformation()


# ============================================================
# LATEST ML PREDICTION
# ============================================================

@app.get(
    "/api/risk/latest"
)
def get_prediction():

    return store.prediction()


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get(
    "/api/system/status"
)
def get_system_status():

    return store.system_status()


# ============================================================
# RAW SENSOR DATA
# ============================================================

@app.get(
    "/api/raw"
)
def get_raw():

    return store.raw_data()
