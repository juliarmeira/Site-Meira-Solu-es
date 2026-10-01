import hashlib
import logging
import time
from typing import Optional, Dict, Any
from urllib.parse import urlparse, urljoin
import httpx

from backend.config import CRAWLER_USER_AGENT, RATE_LIMIT_DELAY

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("BaseCrawler")

class BaseCrawler:
    """Base crawler class for polite scraping of official government portals."""

    def __init__(self, user_agent: str = CRAWLER_USER_AGENT, delay: float = RATE_LIMIT_DELAY):
        self.user_agent = user_agent
        self.delay = delay
        self.headers = {"User-Agent": self.user_agent}

    def _rate_limit(self):
        """Enforces rate limiting between consecutive HTTP requests."""
        time.sleep(self.delay)

    def fetch_url(self, url: str, max_retries: int = 3) -> Optional[httpx.Response]:
        """Fetches URL content with retries and rate limiting."""
        self._rate_limit()

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"Fetching URL (attempt {attempt}/{max_retries}): {url}")
                with httpx.Client(headers=self.headers, follow_redirects=True, timeout=30.0) as client:
                    response = client.get(url)
                    response.raise_for_status()
                    return response
            except Exception as e:
                logger.warning(f"Failed attempt {attempt} for {url}: {e}")
                if attempt < max_retries:
                    time.sleep(self.delay * (2 ** attempt))
                else:
                    logger.error(f"Exhausted retries for URL: {url}")
                    return None

    @staticmethod
    def normalize_url(base_url: str, link: str) -> str:
        """Normalizes relative links to absolute URLs."""
        if not link:
            return base_url
        link = link.strip()
        joined = urljoin(base_url, link)
        parsed = urlparse(joined)
        # Remove tracking parameters or trailing hashes
        clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if parsed.query:
            clean_url += f"?{parsed.query}"
        return clean_url

    @staticmethod
    def compute_sha256(data: Any) -> str:
        """Computes SHA-256 hash of string or bytes content."""
        if isinstance(data, str):
            data_bytes = data.encode("utf-8")
        elif isinstance(data, bytes):
            data_bytes = data
        else:
            data_bytes = str(data).encode("utf-8")
        return hashlib.sha256(data_bytes).hexdigest()
