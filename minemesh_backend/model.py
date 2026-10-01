# model.py

import os
import xgboost as xgb

from config import MODEL_PATH
from ml_features import FEATURES


class DeformationModel:

    def __init__(self):

        self.model = xgb.Booster()

        model_path = os.path.abspath(
            MODEL_PATH
        )

        print(
            f"Loading XGBoost model: {model_path}"
        )

        self.model.load_model(
            model_path
        )

        print("XGBoost model loaded successfully.")

    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    def predict(self, features):

        # Make sure feature order is EXACTLY the
        # same as training.

        values = [
            float(features[name])
            for name in FEATURES
        ]

        matrix = xgb.DMatrix(
            [values],
            feature_names=FEATURES
        )

        prediction = self.model.predict(
            matrix
        )

        return float(
            prediction[0]
        )


# Load model once when backend starts.
deformation_model = DeformationModel()
