"""Base connector interface for all ingestion sources."""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)


class BaseConnector(ABC):
    """Abstract base class for all data source connectors."""

    source_name: str = "unknown"

    @abstractmethod
    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Fetch raw data from source. Returns list of records."""
        ...

    @abstractmethod
    def validate(self, record: Dict[str, Any]) -> bool:
        """Validate a single fetched record."""
        ...

    def run(self, **kwargs) -> List[Dict[str, Any]]:
        """Fetch, validate, and return clean records."""
        logger.info(f"[{self.source_name}] Starting ingestion...")
        raw = self.fetch(**kwargs)
        valid = [r for r in raw if self.validate(r)]
        logger.info(f"[{self.source_name}] {len(valid)}/{len(raw)} records passed validation.")
        return valid
