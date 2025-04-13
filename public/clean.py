import json
import os
from collections import defaultdict

def load_json(file_path):
    if not os.path.exists(file_path):
        print(f"Archivo no encontrado: {file_path}")
        return []
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

def clean_internal_duplicates(data):
    seen_ids = set()
    unique_data = []
    duplicates_removed = 0

    for element in data:
        element_id = element.get('id')
        if element_id in seen_ids:
            duplicates_removed += 1
        else:
            seen_ids.add(element_id)
            unique_data.append(element)

    return unique_data, duplicates_removed

def clean_cross_file_duplicates(file_data_map):
    seen_ids = {}  # id -> archivo donde apareció primero
    duplicate_log = {file: 0 for file in file_data_map}
    duplicate_sources = defaultdict(list)  # archivo duplicado -> [(id, archivo_origen)]

    for file, elements in file_data_map.items():
        new_elements = []
        for element in elements:
            element_id = element.get('id')
            if element_id in seen_ids:
                duplicate_log[file] += 1
                duplicate_sources[file].append((element_id, seen_ids[element_id]))
            else:
                seen_ids[element_id] = file
                new_elements.append(element)
        file_data_map[file] = new_elements

    return duplicate_log, duplicate_sources

def process_files(json_files):
    internal_log = {}
    file_data_map = {}

    # Paso 1: limpiar duplicados internos
    for file_path in json_files:
        data = load_json(file_path)
        unique_data, internal_dupes = clean_internal_duplicates(data)
        internal_log[file_path] = internal_dupes
        file_data_map[file_path] = unique_data

    # Paso 2: limpiar duplicados entre archivos
    cross_file_log, duplicate_sources = clean_cross_file_duplicates(file_data_map)

    # Guardar todos los archivos con los datos limpios
    for file_path, cleaned_data in file_data_map.items():
        save_json(file_path, cleaned_data)

    # Mostrar logs
    print("🧹 Limpieza completada.\n")

    print("📁 Duplicados internos eliminados:")
    for file, count in internal_log.items():
        print(f"- {file}: {count} duplicado(s) interno(s) eliminado(s).")

    print("\n🔁 Duplicados entre archivos eliminados:")
    for file, count in cross_file_log.items():
        if count > 0:
            print(f"- {file}: {count} duplicado(s) externo(s) eliminado(s).")
            for element_id, source_file in duplicate_sources[file]:
                print(f"    • ID '{element_id}' ya estaba en '{source_file}'")

if __name__ == "__main__":
    json_files = [
        'Mexico.json', 'Canada.json', 'LATAM.json', 'OthersFA.json',
        'UK.json', 'Australia.json', 'Spain.json', 'USA.json',
        'Others.json', 'France.json'
    ]

    process_files(json_files)
