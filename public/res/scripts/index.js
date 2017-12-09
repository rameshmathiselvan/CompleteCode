/*NOTE: All response from API Call will contain the following structure
/*
    {
        "status": "success",=====> will contain either 'success' or 'failure'
        "code": 200,======> status code Ex:404,500,200
        "data": {},====>>requested data
        "error": ""====>>if any errors
    }
*/

/* Global Variables Section */

var productsToLoad = [],
    categoryFiltersToApply = [];

/* End of Global Variables */

$(document).ready(function () {

    $(document).on("click", "[data-hide]", function () {
        $(this).closest("." + $(this).attr("data-hide")).hide();
    });

    $(document).on("click", ".remove-prod-btn", function (e) {
        var product = $(e.target).closest(".product-item-row").data("product");
        if (product && product._id) {
            $("#delete-prod-modal").data("productId", product._id).modal();
        }

    });

    $(document).on("click", ".remove-product-modal-btn", function (e) {
        var productId = $(e.target).closest("#delete-prod-modal").data("productId");
        if (productId) {
            removeProduct(productId); // Calling remove to remove product
        }
    });

    $(document).on("click", ".edit-prod-btn", function (e) {
        var product = $(e.target).closest(".product-item-row").data("product");
        if (product && product._id) {
            $("#product-editform-alert").addClass("hide");
            $("#product-addedit-form")
                .data("mode", "edit")
                .data("id", product._id)
                .find("#product-submit")
                .text("Update");

            $("#product-title-text").text("Edit Product");
            if (product) {
                $("#product-name").val(product.name);
                $("#product-category").val(product.category);
                $("#product-price").val(product.price);
                $("#product-description").val(product.description);
            }
        }

    });

    $(document).on("click", "#product-submit", function (e) {
        e.preventDefault && e.preventDefault();

        var product = {
            _id: $("#product-addedit-form").data("id"),
            name: $("#product-name").val(),
            category: $("#product-category").val(),
            price: $("#product-price").val(),
            description: $("#product-description").val()
        },
        formmode = $("#product-addedit-form").data("mode");
        if (!(product && product.name && 
            product.description && product.price 
            && product.category)) {
            $("#product-editform-alert")
                .addClass("alert-danger")
                .removeClass("hide alert-success")
                .show()
                .find(".alert-text")
                .text("Please Fill All Fields");

            return;
        }

        if (formmode === "add") {
            createProduct(product);
        } else if (formmode === "edit") {
            editProduct(product);
        }

    });

    $(document).on("click", "#product-cancel", function (e) {
        e.preventDefault && e.preventDefault();
        $("#product-addedit-form")
            .data("mode", "add")
            .find("#product-submit")
            .text("Save")
            .end()[0]
            .reset();

        $("#product-title-text").text("Ads Product");
    });

	$("#searchText").keyup(function(e) {
        var searchText = $.trim($(e.target).val()).toLowerCase();
        var filteredProducts = filterProducts(searchText);
        displayAllProducts(filteredProducts);
    });

    $(document).on("click", ".remove-category-filter", function (e) {
        e.preventDefault && e.preventDefault();
        $(e.currentTarget).siblings("button")
            .remove().end().remove();

        categoryFiltersToApply = retrieveAppliedFiltersType();
        var filteredProducts = filterProducts($("#searchText").val());
        displayAllProducts(filteredProducts);
    });

    $(document).on("click", ".product-image", function (e) {
        e.preventDefault && e.preventDefault();
        var $file = $(e.currentTarget).siblings(".hidden-file-control");
        $file.trigger("click");
    });

    $(document).on("change", ".hidden-file-control", function (e) {
        e.preventDefault && e.preventDefault();
        var $file = $(e.currentTarget),
            $productImage = $file.siblings(".product-image"),
            reader = new FileReader();

        reader.onload = function (fileev) {
            $productImage.attr("src", fileev.target.result);
        };

        // read the image file as a data URL.
        reader.readAsDataURL(this.files[0]);
    });

    $(document).on("click", ".upload-image-btn", function (e) {
        e.preventDefault && e.preventDefault();
        var $file = $(e.currentTarget).siblings(".hidden-file-control"),
            product = $(e.currentTarget).closest(".product-item-row").data("product");

        uploadImage(product._id, $file.get(0));
    });

	//Initial call to populate the Products list the first time the page loads
	getProducts();

});

//Get List of Products from the database
function getProducts() {

    $.ajax({
        url: "products",
        method: "get",
        cache: false
    }).then(function (response) {
        productsToLoad = response.data;
        categoryFiltersToApply = retrieveAppliedFiltersType();
        var filteredProducts = filterProducts($("#searchText").val());
        displayAllProducts(filteredProducts);
    });
}

function displayAllProducts(products) {
    var uniqueCategories = $.unique(
        $.map(productsToLoad, function (product) {
            return product.category;
        })
    );

    $("#all-categories-container").empty().append(
        uniqueCategories.map(function (category) {
            return $("<button>", {
                class: "btn btn-success",
                id: "draggable-button" + category,
                draggable: true,
                ondragstart: "dragStart(event)"
            }).text(category);
        })
    );

    var rows = $.map(products, function (product) {
        var imageSrc = "/images/product.png";
        if (product.productImg && product.productImg.fileName) {
            imageSrc = "/images/product/" + product.productImg.fileName;
        }

        product.productImg.fileName
        var $productDetailsRow = $("<div>", {
            class: "row product-detail-row"
        }).append([
            $("<div>", {
                class: "col-xs-4 text-center"
            }).append([
                $("<img>", {
                    class: "img img-responsive product-image"
                }).attr("src", imageSrc),
                $("<input>", {
                    type: "file",
                    class: "hidden-file-control hide"
                }),
                $("<button>", {
                    class: "btn btn-link upload-image-btn"
                }).append([
                    $("<span>", {
                        class: "fa fa-upload"
                    }),
                    " Upload"
                ])
            ]),
            $("<div>", {
                class: "col-xs-8"
            }).append([
                $("<h4>").text(product.name),
                $("<p>").text(product.description),
                $("<span>", {
                    class: "label label-default"
                }).text(product.category),
                $("<h5>", {
                    class: "text-danger"
                }).append([
                    $("<strong>").text("Rs: " + product.price)
                ])
            ])
        ]);
        var $buttonRow = $("<div>", {
            class: "row product-action-row"
        }).append([
            $("<div>", {
                class: "col-md-9 col-xs-1"
            }),
            $("<div>", {
                class: "col-md-3 col-xs-11"
            }).append([
                $("<button>", {
                    class: "btn btn-danger remove-prod-btn"
                }).append([
                    $("<i>", {
                        class: "fa fa-trash-o"
                    }),
                    " Remove"
                ]),
                $("<button>", {
                    class: "btn btn-success edit-prod-btn"
                }).append([
                    $("<i>", {
                        class: "fa fa-pencil-square-o"
                    }),
                    " Edit"
                ])
            ])
        ]);
        var $wrapperRow = $("<div>", {
            class: "row product-item-row"
        }).append([
            $productDetailsRow, $buttonRow
        ]).data("product", product);
        return $wrapperRow;
    });
    $("#product-list-grid").empty().append(rows);
}

/*Remove Product*/
function removeProduct(id) {
    //write your code here to remove the product and call when remove button clicked
    $.ajax({
        url: "product/" + id,
        method: "DELETE"
    }).then(function (response) {
        $("#delete-prod-modal").modal("hide");
		//Display alert
        $("#product-list-alert")
            .addClass("alert-success")
            .removeClass("hide alert-danger")
            .show()
            .find(".alert-text")
            .text("Product Successfully Removed");
        // Reload products
        getProducts();
    })
}

/*Update Product*/
function editProduct(product) {
    $.ajax({
        url: "product/" + product._id,
        method: "PUT",
        data: product
    }).then(function (response) {
		//Display alert
        $("#product-editform-alert")
            .addClass("alert-success")
            .removeClass("hide alert-danger")
            .show()
            .find(".alert-text")
            .text("Product Successfully Updated");
		
		//Trigger cancel to clear fields
		$("#product-cancel").trigger("click");
        // Reload products
        getProducts();
    })
}

/*Create Product*/
function createProduct(product) {
    $.ajax({
        url: "product/",
        method: "POST",
        data: product
    }).then(function (response) {
		//Trigger cancel to clear fields
        $("#product-cancel").trigger("click");
		//Display alert
        $("#product-editform-alert")
            .addClass("alert-success")
            .removeClass("hide alert-danger")
            .show()
            .find(".alert-text")
            .text("Product Successfully Saved");
        // Reload products
        getProducts();
    })
}

function retrieveAppliedFiltersType() {
    return $("#category-drop-container button")
        .map(function () {
            return $.trim($(this).text());
        }).get();
}

function filterProducts(searchText) {
    var trimmedSearchText = $.trim(searchText).toLowerCase();
    var filteredProducts = productsToLoad.filter(function (product) {
        var productsDetails = ((product.name || "") + (product.category || "") + (product.description || "") + (product.price || "")).toLowerCase();
        return (productsDetails.indexOf(trimmedSearchText) > -1) &&
            (categoryFiltersToApply.length === 0 || categoryFiltersToApply.indexOf(product.category) > -1);
    });
    return filteredProducts;
}

function dragStart(ev) {
    ev.dataTransfer.dropEffect = "copy";
    ev.dataTransfer.setData("elementId", ev.target.id);
}

function dragOver(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var elementId = ev.dataTransfer.getData("elementId"),
        dragCategory = $.trim($("#" + elementId).text());

    if (categoryFiltersToApply.indexOf(dragCategory) < 0) {
        $("#category-drop-container").append([
            $("<span>").append([
                $("<button>", {
                    class: "btn btn-success"
                }).text(dragCategory),
                $("<a>", {
                    href: "",
                    class: "remove-category-filter"
                }).append([
                    $("<i> ", {
                        class: "fa fa-times"
                    })
                ])
            ])
        ]);
    }
    categoryFiltersToApply = retrieveAppliedFiltersType();
    var filteredProducts = filterProducts($("#searchText").val());
    displayAllProducts(filteredProducts);
}

function uploadImage(productId, fileToAdd) {
    if (fileToAdd && fileToAdd.files && fileToAdd.files[0]) {
        var formData = new FormData();
        formData.append("file", fileToAdd.files[0]);
        $.ajax({
            url: "product/" + productId + "/ProductImg",
            method: "PUT",
            data: formData,
            processData: false,
            contentType: false
        }).then(function (response) {
			//Display alert
            $("#product-list-alert")
                .addClass("alert-success")
                .removeClass("hide alert-danger")
                .show()
                .find(".alert-text")
                .text("Image Successfully Uploaded");
            // Reload products
            getProducts();
        });
    } else {
        $("#product-list-alert")
            .addClass("alert-danger")
            .removeClass("hide alert-success")
            .show()
            .find(".alert-text")
            .text("Click the image to select a new file");
    }
}
