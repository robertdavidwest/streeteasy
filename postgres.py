"""
PostgreSQL database operations for StreetEasy rental listings.
"""
import os
import psycopg2
from psycopg2.extras import execute_batch
from typing import Optional, List, Dict, Any

from street_easy_api import RentalListing


def get_connection():
    """Create and return a database connection using DATABASE_URL."""
    database_url = os.environ['DATABASE_URL']
    return psycopg2.connect(database_url)


def create_table():
    """Create the rentals table if it doesn't exist."""
    sql = """
    CREATE TABLE IF NOT EXISTS rentals (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        bedrooms INTEGER NOT NULL,
        bathrooms REAL NOT NULL,
        price INTEGER NOT NULL
    )
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)


def select_by_id(rental_id: str) -> Optional[Dict[str, Any]]:
    """Select a rental by ID."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM rentals WHERE id = %s", (rental_id,))
            row = cur.fetchone()
            if row:
                return {
                    'id': row[0],
                    'url': row[1],
                    'bedrooms': row[2],
                    'bathrooms': row[3],
                    'price': row[4]
                }
            return None


def get_all_ids() -> set:
    """Get all rental IDs from the database."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM rentals")
            return {row[0] for row in cur.fetchall()}


def write_listings(listings: List[RentalListing]):
    """Write rental listings to the database."""
    sql = """
        INSERT INTO rentals (id, url, bedrooms, bathrooms, price)
        VALUES (%(id)s, %(url)s, %(bedrooms)s, %(bathrooms)s, %(price)s)
        ON CONFLICT (id) DO NOTHING
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            execute_batch(cur, sql, listings)