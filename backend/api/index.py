# Entrypoint serverless do Vercel.
# O @vercel/python serve o ASGI `app` exportado aqui.
from app.main import app  # noqa: F401
