// frappe.listview_settings["Stock Reconciliation"] = {
//   onload: function (listview) {
//     listview.page.add_inner_button(__("Barcode Print"), function () {
//       var selected_rows = listview.get_checked_items();
//       var selected_ids = selected_rows.map((row) => row.name);
//       let d = new frappe.ui.Dialog({
//         title: "Enter details",
//         fields: [
//           {
//             label: "Letter Head",
//             fieldname: "letter_head",
//             fieldtype: "Link",
//             options: "Letter Head",
//           },
//           {
//             label: "Print Format",
//             fieldname: "print_format",
//             fieldtype: "Link",
//             options: "Print Format",
//             reqd: 1,
//             get_query: function () {
//               // Define your filter query here
//               return {
//                 filters: {
//                   doc_type: "Stock Reconciliation",
//                 },
//               };
//             },
//           },
//           {
//             label: "Page Size",
//             fieldname: "page_size",
//             fieldtype: "Select",
//             reqd: 1,
//             options: [
//               { label: "A0", value: "A0" },
//               { label: "A1", value: "A1" },
//               { label: "A2", value: "A2" },
//               { label: "A3", value: "A3" },
//               { label: "A4", value: "A4" },
//               { label: "A5", value: "A5" },
//               { label: "A6", value: "A6" },
//               { label: "A7", value: "A7" },
//               { label: "A8", value: "A8" },
//               { label: "A9", value: "A9" },
//               { label: "B0", value: "B0" },
//               { label: "B1", value: "B1" },
//               { label: "B2", value: "B2" },
//               { label: "B3", value: "B3" },
//               { label: "B4", value: "B4" },
//               { label: "B5", value: "B5" },
//               { label: "B6", value: "B6" },
//               { label: "B7", value: "B7" },
//               { label: "B8", value: "B8" },
//               { label: "B9", value: "B9" },
//               { label: "B10", value: "B10" },
//               { label: "C5E", value: "C5E" },
//               { label: "Comm10E", value: "Comm10E" },
//               { label: "DLE", value: "DLE" },
//               { label: "Executive", value: "Executive" },
//               { label: "Folio", value: "Folio" },
//               { label: "Ledger", value: "Ledger" },
//               { label: "Legal", value: "Legal" },
//               { label: "Letter", value: "Letter" },
//               { label: "Tabloid", value: "Tabloid" },
//               { label: "Custom", value: "Custom" },
//             ],
//           },
//           {
//             label: "Type",
//             fieldname: "type",
//             fieldtype: "Select",
//             options: [
//               { label: "FG Barcode", value: "FG Barcode" },
//               { label: "Material Barcode", value: "Material Barcode" },
//             ],
//             onchange: function () {
//               let select_val = document.querySelector(
//                 "select[data-fieldname='type']"
//               ).value;
//               let page_height_val = document.querySelector(
//                 "input[data-fieldname='page_height']"
//               );
//               let page_width_val = document.querySelector(
//                 "input[data-fieldname='page_width']"
//               );
//               frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                   doctype: "PDF Page Size",
//                   filters: {
//                     name: select_val,
//                   },
//                   fields: ["*"],
//                 },
//                 callback: function (response) {
//                   page_height_val.value = response.message.map(
//                     (data) => data.page_height_in_mm
//                   );
//                   page_width_val.value = response.message.map(
//                     (data) => data.page_width__in_mm
//                   );
//                 },
//               });
//             },
//           },
//           {
//             label: "Page Height (in mm)",
//             fieldname: "page_height",
//             fieldtype: "Int",
//             default: "0",
//             reqd: 0,
//             depends_on: "eval:doc.page_size === 'Custom'",
//           },
//           {
//             label: "Page Width (in mm)",
//             fieldname: "page_width",
//             fieldtype: "Int",
//             reqd: 0,
//             default: "0",
//             depends_on: "eval:doc.page_size === 'Custom'",
//           },
//         ],
//         primary_action_label: "Submit",
//         primary_action(values) {
//           // Handle logic to fetch selected values and call the API
//           // Example:
//           // console.log(selected_ids, values);

//           // CALL THE PRINT BARCODE MULTIPLE PDF FUNCTION
//           PrintBarcode(selected_ids, values);
//           // fetchBarcodePrint(selected_ids, values);
//           d.hide();
//         },
//       });
//       d.show();
//     });
//   },
// };

// function fetchBarcodePrint(selectedIds, values) {
//   let url = `${
//     window.location.origin
//   }/api/method/frappe.utils.print_format.download_multi_pdf?doctype=Stock Reconciliation&name=${JSON.stringify(
//     selectedIds
//   )}&format=${values.print_format}`;

//   if (values.letter_head) {
//     url += `&letterhead=${values.letter_head}`;
//   } else {
//     url += "&no_letterhead=1";
//   }

//   if (values.page_size === "Custom") {
//     url += `&options={"page-height":${values.page_height},"page-width":${values.page_width}}`;
//   } else {
//     url += `&format=${values.print_format}&options={"page-size":"${values.page_size}"}`;
//   }

//   window.location.href = url;
// }

// function PrintBarcode(selected_names, print_configs) {
//   var response_data = "";

//   frappe.call({
//     method: "mezzo_apparels.utils.stock_reconciliation.get_barcode_print",
//     args: {
//       selected_names: selected_names,
//       print_configs: print_configs,
//     },
//     freeze: true,
//     freeze_message: "Generating Print Format...",
//     callback: function (response) {
//       console.log(response.message);
//       response_data = response.message;

//       var field_list = [];
//       var html_content = `<div style="display:flex;flex-direction:column;gap:24px;">`;

//       if (response_data.data) {
//         response_data.data.forEach((data) => {
//           // field_list.push({
//           //   label: data.name,
//           //   fieldname: data.name.toLowerCase(),
//           //   fieldtype: "Button",
//           //   default: data.url,
//           //   onchange: function () {
//           //     window.open(data.url);
//           //   },
//           // });
//           html_content += `
//           <div class="">
//             <h5>${data.name}</h5>
//             <div class="d-flex" style="gap:16px;">
//               <a
//                 class="btn btn-xs btn-default px-3 py-2 w-50"
//                 target="_blank"
//                 href="${data.url}"
//               >
//                 Open PDF
//               </a>
//               <a
//                 class="btn btn-xs btn-default px-3 py-2 w-50"
//                 href="${data.url}"                
//                 download=""
//               >
//                 Download PDF
//               </a>
//             </div>
//           </div>`;
//         });

//         html_content += `</div>`;
//         let print_dialog = new frappe.ui.Dialog({
//           title: "Print Selected Documents",
//           fields: [
//             {
//               label: "Output",
//               fieldname: "output",
//               fieldtype: "HTML",
//               options: html_content,
//             },
//           ],
//         });
//         print_dialog.show();

//         // response_data.data.forEach((data) => {
//         //   window.open(data.url);
//         // });
//       }
//     },
//   });
// }


frappe.listview_settings["Stock Reconciliation"] = {
	onload: function (list_view) {
		list_view.page.add_button("Barcode Print", function() {
			customBulkOps.print(list_view.get_checked_items());
		});
	}
};

class BulkOperations {
	constructor({ doctype }) {
		if (!doctype) frappe.throw(__("Doctype required"));
		this.doctype = doctype;
	}

	print(docs) {
		const print_settings = frappe.model.get_doc(":Print Settings", "Print Settings");
		const allow_print_for_draft = cint(print_settings.allow_print_for_draft);
		const is_submittable = frappe.model.is_submittable(this.doctype);
		const allow_print_for_cancelled = cint(print_settings.allow_print_for_cancelled);
		const letterheads = this.get_letterhead_options();

		const valid_docs = docs
			.filter((doc) => {
				return (
					!is_submittable ||
					doc.docstatus === 1 ||
					(allow_print_for_cancelled && doc.docstatus == 2) ||
					(allow_print_for_draft && doc.docstatus == 0) ||
					frappe.user.has_role("Administrator")
				);
			})
			.map((doc) => doc.name);

		const invalid_docs = docs.filter((doc) => !valid_docs.includes(doc.name));

		if (invalid_docs.length > 0) {
			frappe.msgprint(__("You selected Draft or Cancelled documents"));
			return;
		}

		if (valid_docs.length === 0) {
			frappe.msgprint(__("Select atleast 1 record for printing"));
			return;
		}

		const dialog = new frappe.ui.Dialog({
				title: __("Print Documents"),
				fields: [
					{
						fieldtype: "Select",
						label: __("Print Format"),
						fieldname: "print_sel",
						options: frappe.meta.get_print_formats(this.doctype),
						default: frappe.get_meta(this.doctype).default_print_format,
					},
					{
						fieldtype: "Select",
						label: __("Page Size"),
						fieldname: "page_size",
						options: frappe.meta.get_print_sizes(),
						default: print_settings.pdf_page_size,
					},
					{
						fieldtype: "Link",
						label: __("Type"),
						fieldname: "page_type",
						depends_on: 'eval:doc.page_size == "Custom"',
						options: "PDF Page Size",
						onchange: function() {
							var selectedPageSize = dialog.fields_dict['page_type'].value;
							// console.log(selectedPageSize);
	
							frappe.db.get_value("PDF Page Size", selectedPageSize, 'page_height_in_mm')
								.then((result) => {
									if (result && result.message && result.message.page_height_in_mm) {
										var heightValue = result.message.page_height_in_mm;
										// console.log(heightValue);
										dialog.fields_dict['page_height'].set_input(heightValue);
									} else {
										dialog.fields_dict['page_height'].set_input(0);
									}
								})
	
							frappe.db.get_value("PDF Page Size", selectedPageSize, 'page_width__in_mm')
								.then((result) => {
									if (result && result.message && result.message.page_width__in_mm) {
										var widthValue = result.message.page_width__in_mm;
										// console.log(widthValue);
										dialog.fields_dict['page_width'].set_input(widthValue);
									} else {
										dialog.fields_dict['page_width'].set_input(0);
									}
								})
						}
					},
					{
						fieldtype: "Float",
						label: __("Page Height (in mm)"),
						fieldname: "page_height",
						depends_on: 'eval:doc.page_size == "Custom" || doc.page_size == "Barcode"',
						// default: print_settings.pdf_page_height,
					},
					{
						fieldtype: "Float",
						label: __("Page Width (in mm)"),
						fieldname: "page_width",
						depends_on: 'eval:doc.page_size == "Custom" || doc.page_size == "Barcode"',
						// default: print_settings.pdf_page_width,
					},
				],
			});

		dialog.set_primary_action(__("Print"), (args) => {
			if (!args) return;
			const default_print_format = frappe.get_meta(this.doctype).default_print_format;
			const with_letterhead = args.letter_sel == __("No Letterhead") ? 0 : 1;
			const print_format = args.print_sel ? args.print_sel : default_print_format;
			const json_string = JSON.stringify(valid_docs);
			const letterhead = args.letter_sel;

			let pdf_options;
			if (args.page_size === "Custom") {
				if (args.page_height === 0 || args.page_width === 0) {
					frappe.throw(__("Page height and width cannot be zero"));
				}
				pdf_options = JSON.stringify({
					"page-height": args.page_height,
					"page-width": args.page_width,
				});
			} else {
				pdf_options = JSON.stringify({ "page-size": args.page_size });
			}

			const w = window.open(
				"/api/method/frappe.utils.print_format.download_multi_pdf?" +
					"doctype=" +
					encodeURIComponent(this.doctype) +
					"&name=" +
					encodeURIComponent(json_string) +
					"&format=" +
					encodeURIComponent(print_format) +
					"&no_letterhead=" +
					(with_letterhead ? "0" : "1") +
					"&letterhead=" +
					encodeURIComponent(letterhead) +
					"&options=" +
					encodeURIComponent(pdf_options)
			);

			if (!w) {
				frappe.msgprint(__("Please enable pop-ups"));
				return;
			}
		});

		dialog.show();
	}

	get_letterhead_options() {
		const letterhead_options = [__("No Letterhead")];
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Letter Head",
				fields: ["name", "is_default"],
				filters: { disabled: 0 },
				limit_page_length: 0,
			},
			async: false,
			callback(r) {
				if (r.message) {
					r.message.forEach((letterhead) => {
						if (letterhead.is_default) {
							letterhead_options.unshift(letterhead.name);
						} else {
							letterhead_options.push(letterhead.name);
						}
					});
				}
			},
		});
		return letterhead_options;
	}

	delete(docnames, done = null) {
		frappe
			.call({
				method: "frappe.desk.reportview.delete_items",
				freeze: true,
				freeze_message:
					docnames.length <= 10
						? __("Deleting {0} records...", [docnames.length])
						: null,
				args: {
					items: docnames,
					doctype: this.doctype,
				},
			})
			.then((r) => {
				let failed = r.message;
				if (!failed) failed = [];

				if (failed.length && !r._server_messages) {
					frappe.throw(
						__("Cannot delete {0}", [failed.map((f) => f.bold()).join(", ")])
					);
				}
				if (failed.length < docnames.length) {
					frappe.utils.play_sound("delete");
					if (done) done();
				}
			});
	}

	assign(docnames, done) {
		if (docnames.length > 0) {
			const assign_to = new frappe.ui.form.AssignToDialog({
				obj: this,
				method: "frappe.desk.form.assign_to.add_multiple",
				doctype: this.doctype,
				docname: docnames,
				bulk_assign: true,
				re_assign: true,
				callback: done,
			});
			assign_to.dialog.clear();
			assign_to.dialog.show();
		} else {
			frappe.msgprint(__("Select records for assignment"));
		}
	}

	apply_assignment_rule(docnames, done) {
		if (docnames.length > 0) {
			frappe
				.call("frappe.automation.doctype.assignment_rule.assignment_rule.bulk_apply", {
					doctype: this.doctype,
					docnames: docnames,
				})
				.then(() => done());
		}
	}

	submit_or_cancel(docnames, action = "submit", done = null) {
		action = action.toLowerCase();
		frappe
			.call({
				method: "frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs",
				args: {
					doctype: this.doctype,
					action: action,
					docnames: docnames,
				},
			})
			.then((r) => {
				let failed = r.message;
				if (!failed) failed = [];

				if (failed.length && !r._server_messages) {
					frappe.throw(
						__("Cannot {0} {1}", [action, failed.map((f) => f.bold()).join(", ")])
					);
				}
				if (failed.length < docnames.length) {
					frappe.utils.play_sound(action);
					if (done) done();
				}
			});
	}

	edit(docnames, field_mappings, done) {
		let field_options = Object.keys(field_mappings).sort(function (a, b) {
			return __(cstr(field_mappings[a].label)).localeCompare(
				cstr(__(field_mappings[b].label))
			);
		});
		const status_regex = /status/i;

		const default_field = field_options.find((value) => status_regex.test(value));

		const dialog = new frappe.ui.Dialog({
			title: __("Bulk Edit"),
			fields: [
				{
					fieldtype: "Select",
					options: field_options,
					default: default_field,
					label: __("Field"),
					fieldname: "field",
					reqd: 1,
					onchange: () => {
						set_value_field(dialog);
					},
				},
				{
					fieldtype: "Data",
					label: __("Value"),
					fieldname: "value",
					onchange() {
						show_help_text();
					},
				},
			],
			primary_action: ({ value }) => {
				const fieldname = field_mappings[dialog.get_value("field")].fieldname;
				dialog.disable_primary_action();
				frappe
					.call({
						method: "frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs",
						args: {
							doctype: this.doctype,
							freeze: true,
							docnames: docnames,
							action: "update",
							data: {
								[fieldname]: value || null,
							},
						},
					})
					.then((r) => {
						let failed = r.message || [];

						if (failed.length && !r._server_messages) {
							dialog.enable_primary_action();
							frappe.throw(
								__("Cannot update {0}", [
									failed.map((f) => (f.bold ? f.bold() : f)).join(", "),
								])
							);
						}
						done();
						dialog.hide();
						frappe.show_alert(__("Updated successfully"));
					});
			},
			primary_action_label: __("Update {0} records", [docnames.length]),
		});

		if (default_field) set_value_field(dialog); // to set `Value` df based on default `Field`
		show_help_text();

		function set_value_field(dialogObj) {
			const new_df = Object.assign({}, field_mappings[dialogObj.get_value("field")]);
			/* if the field label has status in it and
			if it has select fieldtype with no default value then
			set a default value from the available option. */
			if (
				new_df.label.match(status_regex) &&
				new_df.fieldtype === "Select" &&
				!new_df.default
			) {
				let options = [];
				if (typeof new_df.options === "string") {
					options = new_df.options.split("\n");
				}
				//set second option as default if first option is an empty string
				new_df.default = options[0] || options[1];
			}
			new_df.label = __("Value");
			new_df.onchange = show_help_text;

			delete new_df.depends_on;
			dialogObj.replace_field("value", new_df);
			show_help_text();
		}

		function show_help_text() {
			let value = dialog.get_value("value");
			if (value == null || value === "") {
				dialog.set_df_property(
					"value",
					"description",
					__("You have not entered a value. The field will be set to empty.")
				);
			} else {
				dialog.set_df_property("value", "description", "");
			}
		}

		dialog.refresh();
		dialog.show();
	}

	add_tags(docnames, done) {
		const dialog = new frappe.ui.Dialog({
			title: __("Add Tags"),
			fields: [
				{
					fieldtype: "MultiSelectPills",
					fieldname: "tags",
					label: __("Tags"),
					reqd: true,
					get_data: function (txt) {
						return frappe.db.get_link_options("Tag", txt);
					},
				},
			],
			primary_action_label: __("Add"),
			primary_action: () => {
				let args = dialog.get_values();
				if (args && args.tags) {
					dialog.set_message("Adding Tags...");

					frappe.call({
						method: "frappe.desk.doctype.tag.tag.add_tags",
						args: {
							tags: args.tags,
							dt: this.doctype,
							docs: docnames,
						},
						callback: () => {
							dialog.hide();
							done();
						},
					});
				}
			},
		});
		dialog.show();
	}

	export(doctype, docnames) {
		frappe.require("data_import_tools.bundle.js", () => {
			const data_exporter = new frappe.data_import.DataExporter(
				doctype,
				"Insert New Records"
			);
			data_exporter.dialog.set_value("export_records", "by_filter");
			data_exporter.filter_group.add_filters_to_filter_group([
				[doctype, "name", "in", docnames, false],
			]);
		});
	}
}

const customBulkOps = new BulkOperations({ doctype: "Stock Reconciliation" });