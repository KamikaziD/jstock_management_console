import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';


export const StockManagment = () => {

    let emptyProduct = {
        id: null,
        supplier: '',
        code: '',
        item: '',
        category: '',
        description: '',
        price: '',
        stockonhand: '',
        stockvalue: '',
        processed: '',
        itemsprocessed: ''
    };


    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    
    function setData(data){
        setProducts(data);
        console.log(data)
    };

    useEffect(() => {
        fetch('http://localhost:3000/getproducts')
            .then(response=> response.json())
            .then(data => setData(data));
    }, []);

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'ZAR' });
    }

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    }

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    }

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    }

    const saveProduct = () => {
        setSubmitted(true);

        if (product.code.trim()) {
            let _products = [...products];
            let _product = { ...product };

            if (product.id) {
                const index = findIndexById(product.id);

                _products[index] = _product;

                const input = {
                    id: product.id,
                    supplier: product.supplier,
                    code: product.code,
                    item: product.item,
                    category: product.category,
                    description: product.description,
                    price: product.price,
                    stockonhand: product.stockonhand
                }
                console.log('UPDATE BACKEND');
                return fetch('http://localhost:3000/updateproduct', {
                  method: 'PUT',
                  body: JSON.stringify(input),
                  headers: {
                      'Content-Type': 'application/json'
                  }
                }).then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        console.log(response);
                        return response;
                        
                    } else {
                        console.log('Something went wrong');
                    }
                }).then(window.location.reload()
                ).then(toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 })
                ).catch(err => err);
            
            } else {
                _product.id = createId();
                _product.image = 'product-placeholder.svg';
                _products.push(_product);
                
                const input = {
                    id: product.id,
                    supplier: product.supplier,
                    code: product.code,
                    item: product.item,
                    category: product.category,
                    description: product.description,
                    price: product.price,
                    stockonhand: product.stockonhand
                }

                console.log('WRITE NEW TO BACKEND');
                return fetch('http://localhost:3000/insertproduct', {
                  method: 'POST',
                  body: JSON.stringify(input),
                  headers: {
                      'Content-Type': 'application/json'
                  }

                }).then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        console.log(response);
                        return response;
                        
                    } else {
                        console.log('Something went wrong');
                    }
                }).then(window.location.reload()
                ).then(toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 })
                ).catch(err => err);
                
            }
        }
            setProducts(this._products);
            setProductDialog(false);
            setProduct(emptyProduct);

        
    
            
    }

    const editProduct = (product) => {
        setProduct({ ...product });
        setProductDialog(true);
    }

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    }

//NEXT SECTION TO MAKE IT WORK
    const deleteProduct = () => {
        let _products = products.filter(val => val.id !== product.id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        const input = {
            id: product.id,
            code: product.code
        }
        console.log('DELETE FROM BACKEND');

                return fetch('http://localhost:3000/deleteproduct', {
                  method: 'DELETE',
                  body: JSON.stringify(input),
                  headers: {
                      'Content-Type': 'application/json'
                  }

                }).then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        console.log(response);
                        return response;
                        
                    } else {
                        console.log('Something went wrong');
                    }
                }).then(window.location.reload()
                ).then(toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 })
                ).catch(err => err);

    }

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    }

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    }

    const deleteSelectedProducts = () => {
        let _products = products.filter(val => !selectedProducts.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    }

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    }

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} />
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Import" chooseLabel="Import" className="p-mr-2 p-d-inline-block" />
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        )
    }

    const codeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.code}
            </>
        );
    }

    const supplierBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Supplier</span>
                {rowData.supplier}
            </>
        );
    }
    
    const itemBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Item</span>
                {rowData.item}
            </>
        );
    }

    const categoryBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Category</span>
                {rowData.category}
            </>
        );
    }

    const priceBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Price</span>
                {formatCurrency(rowData.price)}
            </>
        );
    }

    const onhandBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock on Hand</span>
                {rowData.stockonhand - rowData.processed}
            </>
        );
    }

    const itemsProcessedBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"># of Items</span>
                {rowData.itemsprocessed}
            </>
        );
    }

    const processedBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Processed</span>
                {rowData.processed}
            </>
        );
    }

    const valueBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Processed</span>
                {formatCurrency((rowData.stockonhand - rowData.processed) * rowData.price)}
            </>
        );
    }

    const avgcostBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Processed</span>
                {formatCurrency((rowData.processed / rowData.itemsprocessed) * rowData.price)}
            </>
        );
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteProduct(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="table-header">
            <h5 className="p-m-0">Manage Products</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProduct} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProducts} />
        </>
    );

    return (
        <div className="p-grid crud-demo">
            <div className="p-col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable ref={dt} value={products} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter} emptyMessage="No products found." header={header}>
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="code" header="Code" sortable body={codeBodyTemplate} sort></Column>
                        <Column field="supplier" header="Supplier" sortable body={supplierBodyTemplate}></Column>
                        <Column field="item" header="Item" sortable body={itemBodyTemplate}></Column>
                        <Column field="category" header="Category" sortable body={categoryBodyTemplate}></Column>
                        <Column field="price" header="Price" body={priceBodyTemplate}sortable></Column>
                        <Column field="stockvalue" header="Stock Value" body={valueBodyTemplate}></Column>
                        <Column field="stockonhand" header="Stock on Hand" body={onhandBodyTemplate}></Column>
                        <Column field="processed" header="Processed" sortable body={processedBodyTemplate}></Column>
                        <Column field="itemsprocessed" header="Items Processed" body={itemsProcessedBodyTemplate}></Column>
                        <Column field="avgcost" header="Avg Cost" body={avgcostBodyTemplate}></Column>

                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        {product.image && <img src={`assets/demo/images/product/${product.image}`} alt={product.image} className="product-image" />}
                        <div className="p-field">
                            <label htmlFor="code">Code</label>
                            <InputText id="code" value={product.code} onChange={(e) => onInputChange(e, 'code')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.code })} />
                            {submitted && !product.code && <small className="p-invalid">Code is required.</small>}
                            
                            <label htmlFor="item">Item</label>
                            <InputText id="item" value={product.item} onChange={(e) => onInputChange(e, 'item')} required />
                            <label htmlFor="supplier">Supplier</label>
                            <InputText id="supplier" value={product.supplier} onChange={(e) => onInputChange(e, 'supplier')} required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" value={product.description} onChange={(e) => onInputChange(e, 'description')} required rows={3} cols={20} />
                        </div>

                        <div className="p-field">
                            <label className="p-mb-3">Category</label>
                            <div className="p-formgrid p-grid">
                                <div className="p-field-radiobutton p-col-6">
                                    <RadioButton inputId="category1" name="category" value="SKI" onChange={onCategoryChange} checked={product.category === 'SKI'} />
                                    <label htmlFor="category1">SKI</label>
                                </div>
                                <div className="p-field-radiobutton p-col-6">
                                    <RadioButton inputId="category2" name="category" value="LCC" onChange={onCategoryChange} checked={product.category === 'LCC'} />
                                    <label htmlFor="category2">LCC</label>
                                </div>
                                <div className="p-field-radiobutton p-col-6">
                                    <RadioButton inputId="category3" name="category" value="LOC" onChange={onCategoryChange} checked={product.category === 'LOC'} />
                                    <label htmlFor="category3">LOC</label>
                                </div>
                                <div className="p-field-radiobutton p-col-6">
                                    <RadioButton inputId="category4" name="category" value="FLEECE" onChange={onCategoryChange} checked={product.category === 'FLEECE'} />
                                    <label htmlFor="category4">FLEECE</label>
                                </div>
                                <div className="p-field-radiobutton p-col-6">
                                    <RadioButton inputId="category5" name="category" value="HOODIES" onChange={onCategoryChange} checked={product.category === 'HOODIES'} />
                                    <label htmlFor="category5">HOODIES</label>
                                </div>
                                <div className="p-field-radiobutton p-col-6">
                                    <RadioButton inputId="category6" name="category" value="DENIM" onChange={onCategoryChange} checked={product.category === 'DENIM'} />
                                    <label htmlFor="category6">DENIM</label>
                                </div>
                            </div>
                        </div>

                        <div className="p-formgrid p-grid">
                            <div className="p-field p-col">
                                <label htmlFor="price">Price per Kilogram</label>
                                <InputNumber id="price" value={product.price} onValueChange={(e) => onInputNumberChange(e, 'price')} mode="currency" currency="ZAR" locale="en-US" />
                            </div>
                            <div className="p-field p-col">
                                <label htmlFor="stockonhand">Stock on Hand</label>
                                <InputNumber id="stockonhand" value={product.stockonhand} onValueChange={(e) => onInputNumberChange(e, 'stockonhand')} integeronly />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete <b>{product.name}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
