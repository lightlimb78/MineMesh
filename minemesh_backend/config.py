# config.py

# ============================================================
# ML MODEL
# ============================================================

MODEL_PATH = "model.json"


# ============================================================
# SENSOR NODE CONFIGURATION
# ============================================================

# Each physical sensor node should have fixed coordinates.
#
# Replace these with your actual node coordinates.

NODE_CONFIG = {
    "0": {
        "latitude": 22.5726,
        "longitude": 88.3639,
        "distance_to_mine_km": 0.0,
    },

    # Example for another node:
    #
    # "1": {
    #     "latitude": 22.5730,
    #     "longitude": 88.3645,
    #     "distance_to_mine_km": 0.5,
    # },
}


# ============================================================
# PRECIPITATION
# ============================================================

# Temporary value.
#
# Your ESP32 does NOT currently measure precipitation.
# Replace this later with:
# - weather API data
# - rain gauge
# - another sensor

DEFAULT_PRECIPITATION_MM = 0.0
