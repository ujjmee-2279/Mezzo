import frappe
from frappe.utils import get_url
from frappe.utils.pdf import get_pdf
from frappe.utils.file_manager import save_file


# def get_print(
# 	doctype=None,
# 	name=None,
# 	print_format=None,
# 	style=None,
# 	as_pdf=False,
# 	doc=None,
# 	output=None,
# 	no_letterhead=0,
# 	password=None,
# 	pdf_options=None,
# 	letterhead=None,
# ):


# SAVE BARCODE PRINT WITH SELECTED PRINT FORMAT AND OPTIONS
@frappe.whitelist()
def get_barcode_print(selected_names, print_configs):
    try:
        # PARSE JSON DATA
        selected_names = frappe.parse_json(selected_names)
        print_configs = frappe.parse_json(print_configs)

        # DEFINE VARIABLES
        final_data = []
        pdf_options = {}
        doctype = "Stock Reconciliation"
        base_url = get_url()
        print_format = print_configs.get("print_format") or "Standard"
        letterhead = print_configs.get("letter_head") or None
        page_size = print_configs.get("page_size") or None
        page_height = print_configs.get("page_height") or None
        page_width = print_configs.get("page_width") or None

        # SET PDF OPTIONS
        if page_size == "Custom":
            pdf_options["page-width"] = f"{page_width}mm"
            pdf_options["page-height"] = f"{page_height}mm"
        else:
            pdf_options["page-size"] = page_size

        # SET ERROR MESSAGE
        if not selected_names:
            frappe.throw(f"Please Select At Least One {doctype}")

        # FOR SELECTED DOCUMENTS
        for name in selected_names:
            pdf_html = frappe.get_print(
                doctype=doctype,
                name=name,
                print_format=print_format,
                # pdf_options=pdf_options,
                letterhead=letterhead,
            )
            pdf_content = get_pdf(html=pdf_html, options=pdf_options)
            file_name = f"{name}_BARCODE.pdf"

            # DELETE IF THE PRINT IS ALREADY ATTACHED OR NOT
            if frappe.db.exists(
                "File", {"file_name": ["like", "%" + name + "_BARCODE" + "%"]}
            ):
                file_doc = frappe.get_doc(
                    "File", {"file_name": ["like", "%" + name + "_BARCODE" + "%"]}
                )
                file_doc.delete()

            # ATTACH NEW PDF
            file_doc = frappe.get_doc(
                {
                    "doctype": "File",
                    "file_name": file_name,
                    "attached_to_doctype": doctype,
                    "attached_to_name": name,
                    "content": pdf_content,
                    "folder": "",
                }
            )
            file_doc.save()

            final_data.append(
                {
                    "name": name,
                    "url": base_url + file_doc.file_url,
                }
            )
    except Exception as e:
        frappe.db.rollback()
        return {
            "error": str(e),
        }

    else:
        frappe.db.commit()
        return {"data": final_data}
