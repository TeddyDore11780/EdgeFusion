import json
from datetime import datetime


def handle(event, context):
    try:
        # Read request body
        if isinstance(event.body, bytes):
            body = event.body.decode("utf-8")
        else:
            body = event.body

        # Parse JSON
        data = json.loads(body)

        # --------------------------------------------------
        # Extract sensor data
        # --------------------------------------------------

        device_id = data.get("deviceId", "unknown-device")

        temperature = float(data.get("temperature", 0))
        humidity = float(data.get("humidity", 0))
        light = int(data.get("light", 0))

        motion = data.get("motion", False)

        # --------------------------------------------------
        # Validate sensor data
        # --------------------------------------------------

        if not isinstance(motion, bool):
            raise ValueError("motion must be boolean")

        if temperature < -40 or temperature > 80:
            raise ValueError("temperature out of valid range")

        if humidity < 0 or humidity > 100:
            raise ValueError("humidity out of valid range")

        if light < 0 or light > 4095:
            raise ValueError("light out of valid range")

        # --------------------------------------------------
        # Determine status
        # --------------------------------------------------

        status = "NORMAL"

        if temperature >= 35:
            status = "HIGH_TEMPERATURE"

        if humidity >= 80:
            status = "HIGH_HUMIDITY"

        # --------------------------------------------------
        # Build processed result
        # --------------------------------------------------

        result = {
            "deviceId": device_id,
            "temperature": temperature,
            "humidity": humidity,
            "light": light,
            "motion": motion,
            "status": status,
            "processed": True,
            "processedAt": datetime.utcnow().isoformat() + "Z"
        }

        # --------------------------------------------------
        # Return processed sensor data
        # --------------------------------------------------

        return {
            "statusCode": 200,
            "body": json.dumps(result),
            "headers": {
                "Content-Type": "application/json"
            }
        }

    except Exception as error:

        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": str(error),
                "processed": False
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        }
