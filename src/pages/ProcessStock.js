import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import moment from 'moment';


export const ProcessStock = () => {

    let emptyProcessed = {
        id: null,
        code: '',
        stockprocessed: '',
        numberofitems: '',
        processdate: ''
    };


    const [processed, setProcessed] = useState(null);
    const [processDialog, setProcessDialog] = useState(false);
    const [deleteProcessDialog, setDeleteProcessDialog] = useState(false);
    const [deleteProcessedDialog, setDeleteProcessedDialog] = useState(false);
    const [processitem, setProcessitem] = useState(emptyProcessed);
    const [selectedProcessed, setSelectedProcessed] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    
    function setData(data){
        setProcessed(data);
        console.log(data)
    };

    useEffect(() => {
        fetch('http://localhost:3000/getprocessed')
            .then(response=> response.json())
            .then(data => setData(data));
    }, []);

    const formatDate = (value) => {
        return moment(value).format('yyyy-MM-DD')
    }

    const openNew = () => {
        setProcessitem(emptyProcessed);
        setSubmitted(false);
        setProcessDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setProcessDialog(false);
    }

    const hideDeleteProcessItemDialog = () => {
        setDeleteProcessDialog(false);
    }

    const hideDeleteProcessedDialog = () => {
        setDeleteProcessedDialog(false);
    }

    const saveProcessed = () => {
        setSubmitted(true);

        if (processitem.code.trim()) {
            let _processed = [...processed];
            let _processitem = { ...processitem };

                _processitem.id = createId();
                _processed.push(_processitem);
                
                const input = {
                    id: processitem.id,
                    code: processitem.code,
                    stockprocessed: processitem.stockprocessed,
                    numberofitems: processitem.numberofitems
                }

                console.log('WRITE NEW TO BACKEND');
                return fetch('http://localhost:3000/insertprocessed', {
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
                ).then(toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Transaction Created', life: 3000 })
                ).catch(err => err);
                
            }
        
            setProcessed(this._processed);
            setProcessDialog(false);
            setProcessitem(emptyProcessed);  
    }

    const confirmDeleteProcessItem = (processitem) => {
        setProcessitem(processitem);
        setDeleteProcessDialog(true);
    }

//NEXT SECTION TO MAKE IT WORK
    const deleteProcessItem = () => {
        let _processed = processed.filter(val => val.id !== processitem.id);
        setProcessed(_processed);
        setDeleteProcessDialog(false);
        setProcessitem(emptyProcessed);
        const input = {
            id: processitem.id
        }
        console.log('DELETE FROM BACKEND');

                return fetch('http://localhost:3000/deleteprocessed', {
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
                ).then(toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Transaction Deleted', life: 3000 })
                ).catch(err => err);

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

    const deleteSelectedProcessed = () => {
        let _processed = processed.filter(val => !selectedProcessed.includes(val));
        setProcessed(_processed);
        setDeleteProcessedDialog(false);
        setSelectedProcessed(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Transaction Deleted', life: 3000 });
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _processitem = { ...processitem };
        _processitem[`${name}`] = val;

        setProcessitem(_processitem);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Process Stock" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={openNew} />
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

    const stockprocessedBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Processed</span>
                {rowData.stockprocessed}
            </>
        );
    }
    
    const numberofitemsBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Number of Items</span>
                {rowData.numberofitems}
            </>
        );
    }

    const processdateBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Processed Date</span>
                {formatDate(rowData.processdate)}
            </>
        );
    }
    
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteProcessItem(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="table-header">
            <h5 className="p-m-0">Process Stock</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const processitemDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProcessed} />
        </>
    );
    const deleteProcessItemDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProcessItemDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteProcessItem} />
        </>
    );
    const deleteProcessedDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProcessedDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProcessed} />
        </>
    );

    return (
        <div className="p-grid crud-demo">
            <div className="p-col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable ref={dt} value={processed} selection={selectedProcessed} onSelectionChange={(e) => setSelectedProcessed(e.value)}
                        dataKey="id" paginator rows={25} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter} emptyMessage="No products found." header={header}>
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="code" header="Code" sortable body={codeBodyTemplate} sort={true} ></Column>
                        <Column field="stockprocessed" header="Stock Processed" sortable body={stockprocessedBodyTemplate}></Column>
                        <Column field="numberifitems" header="Numberof Items" sortable body={numberofitemsBodyTemplate}></Column>
                        <Column field="processdate" header="Processed Date" sortable body={processdateBodyTemplate}></Column>
                        
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={processDialog} style={{ width: '450px' }} header="PROCESS STOCK" modal className="p-fluid" footer={processitemDialogFooter} onHide={hideDialog}>
                        <div className="p-field">
                            <label htmlFor="code">Code</label>
                            <InputText id="code" value={processitem.code} onChange={(e) => onInputChange(e, 'code')} required autoFocus className={classNames({ 'p-invalid': submitted && !processitem.code })} />
                            {submitted && !processitem.code && <small className="p-invalid">Code is required.</small>}
                            
                            <label htmlFor="stockprocessed">Stock Processed in KG's</label>
                            <InputText id="stockprocessed" value={processitem.stockprocessed} onChange={(e) => onInputChange(e, 'stockprocessed')} required />
                            <label htmlFor="numberofitems">Number of Items</label>
                            <InputText id="numberofitems" value={processitem.numberofitems} onChange={(e) => onInputChange(e, 'numberofitems')} required />
                        </div>

                    </Dialog>

                    <Dialog visible={deleteProcessDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProcessItemDialogFooter} onHide={hideDeleteProcessItemDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                            {processitem && <span>Are you sure you want to delete <b>{processitem.name}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProcessedDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProcessedDialogFooter} onHide={hideDeleteProcessedDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                            {processitem && <span>Are you sure you want to delete the selected transaction?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
