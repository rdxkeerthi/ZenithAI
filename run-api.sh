#!/bin/bash
# Simple direct run - no venv, no complex setup

cd apps/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
