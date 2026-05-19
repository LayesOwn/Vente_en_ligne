"""Utilitaires de sécurité : rate limiting in-memory."""
from collections import defaultdict
from threading import Lock
from time import monotonic


class _SlidingWindow:
    """Fenêtre glissante thread-safe, sans dépendance externe."""

    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window = window_seconds
        self._store: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, key: str) -> bool:
        now = monotonic()
        cutoff = now - self.window
        with self._lock:
            self._store[key] = [t for t in self._store[key] if t > cutoff]
            if len(self._store[key]) >= self.max_calls:
                return False
            self._store[key].append(now)
            return True

    def retry_after(self, key: str) -> int:
        """Secondes avant que la prochaine tentative soit autorisée."""
        now = monotonic()
        cutoff = now - self.window
        with self._lock:
            recent = sorted(t for t in self._store.get(key, []) if t > cutoff)
            if len(recent) < self.max_calls:
                return 0
            return max(0, int(self.window - (now - recent[0])) + 1)


# 5 tentatives de login par IP par tranche de 60 secondes
login_limiter = _SlidingWindow(max_calls=5, window_seconds=60)
