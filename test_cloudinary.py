import requests
import base64
import io

cloud_name = "dg668htg4"
upload_preset = "preset-1"

# small 1x1 white pixel
img_bytes = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=")

url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"

print("Multipart with filename:")
response = requests.post(
    url,
    data={'upload_preset': upload_preset},
    files={'file': ('foto.png', img_bytes, 'image/png')}
)
print(response.json())
