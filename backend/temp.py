import csv
with open('image_urls.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(
        f"UPDATE rentals SET image_url = '{row['image_url']}' WHERE id = '{row['id']}';")
