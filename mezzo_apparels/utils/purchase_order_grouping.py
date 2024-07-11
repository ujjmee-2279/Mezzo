import frappe
def aggregate_data(data, attribute_values_and_abbreviations):
    variant_data = []
    name_data = []

    for item in data:
        if 'variant_of' in item:
            variant_found = False
            for variant in variant_data:
                if variant['variant_of'] == item['variant_of']:
                    variant['total_qty'].append(f"{item['qty']}")
                    variant['total_rate'] += item['qty'] * item['rate']
                    variant['remarks'].append(item['remarks'])
                    variant['attributes'].append(attribute_values_and_abbreviations[item['attribute_value']])
                    variant_found = True
                    break
            if not variant_found:
                variant_data.append({
                    'variant_of': item['variant_of'],
                    'total_qty': [f"{item['qty']}"],
                    'total_rate': item['qty'] * item['rate'],
                    'remarks': [item['remarks']],
                    'attributes': [attribute_values_and_abbreviations[item['attribute_value']]]
                })
        else:
            name_data.append({
                'Name': item['Name'],
                'total_qty': str(item['qty']),
                'total_rate': item['qty'] * item['rate'],
                'remarks': item['remarks']
            })

    # Convert the total_qty, remarks, and attributes lists to strings
    for variant in variant_data:
        variant['total_qty'] = '/'.join(variant['total_qty'])
        variant['remarks'] = ','.join(variant['remarks'])
        variant['attributes'] = '/'.join(variant['attributes'])
    
    return name_data + variant_data