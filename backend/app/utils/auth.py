import logging
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_log = logging.getLogger("dasha")

SECRET_KEY = os.getenv("SECRET_KEY", "dasha-shop-secret-key-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

_IS_PROD = os.getenv("ENVIRONMENT", "").lower() == "production"

if _IS_PROD and (
    SECRET_KEY == "dasha-shop-secret-key-change-in-production"
    or len(SECRET_KEY) < 32
):
    _log.critical(
        "SECRET_KEY invalide en production ! "
        "Générez-en une avec : python -c \"import secrets; print(secrets.token_hex(32))\""
    )

_security = HTTPBearer()


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": "admin", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(_security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide ou expiré"
        )
