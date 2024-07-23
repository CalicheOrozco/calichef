import json

def sort_json_by_rating_count(file_path, output_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # Convertir 'rating_count' a entero si es posible, de lo contrario canadar 0
        for item in data:
            try:
                item['rating_count'] = int(item['rating_count'])
            except ValueError:
                item['rating_count'] = 0
            
        sorted_data = sorted(data, key=lambda x: x['rating_count'], reverse=True)

        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(sorted_data, file, indent=4)

        print("Archivo JSON ordenado y guardado con éxito.")

    except Exception as e:
        print(f"Error al procesar los archivos: {e}")

# Ruta del archivo JSON original
file_path = 'others.json'

# Ruta del archivo JSON ordenado
output_path = 'others.json'

sort_json_by_rating_count(file_path, output_path)
