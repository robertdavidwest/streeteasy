#!/usr/bin/env python3
"""Generate UPDATE SQL statements for image URLs."""
import csv
import sys


def main():
    """Read CSV and generate UPDATE statements."""
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'image_urls.csv'

    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rental_id = row['id'].replace("'", "''")  # Escape quotes
            image_url = row['image_url'].replace("'", "''")  # Escape quotes
            print(f"UPDATE rentals SET image_url = '{image_url}' "
                  f"WHERE id = '{rental_id}';")


if __name__ == '__main__':
    main()
