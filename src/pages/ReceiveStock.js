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


export const ReceiveStock = () => {

    let emptyReceived = {
        id: null,
        code: '',
        stockreceived: '',
        receiveddate: '',
        stockonhand: ''
    };


    const [received, setReceived] = useState(null);
    const [receiveDialog, setReceiveDialog] = useState(false);
    const [deleteReceiveDialog, setDeleteReceiveDialog] = useState(false);
    const [deleteReceivedDialog, setDeleteReceivedDialog] = useState(false);
    const [receiveitem, setReceiveitem] = useState(emptyReceived);
    const [selectedReceived, setSelectedReceived] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    
    function setData(data){
        setReceived(data);
        console.log(data)
    };

    useEffect(() => {
        fetch('http://localhost:3000/getreceived')
            .then(response=> response.json())
            .then(data => setData(data));
            
    }, []);

    const formatDate = (value) => {
        return moment(value).format('yyyy-MM-DD')
    }

    const openNew = () => {
        setReceiveitem(emptyReceived);
        setSubmitted(false);
        setReceiveDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setReceiveDialog(false);
    }

    const hideDeleteReceivedItemDialog = () => {
        setDeleteReceiveDialog(false);
    }

    const hideDeleteReceivedDialog = () => {
        setDeleteReceivedDialog(false);
    }

    const saveReceived = () => {
        setSubmitted(true);

        if (receiveitem.code.trim()) {
            let _received = [...received];
            let _receiveitem = { ...receiveitem };

                _receiveitem.id = createId();
                _received.push(_receiveitem);
                
                const input = {
                    id: receiveitem.id,
                    code: receiveitem.code,
                    stockreceived: receiveitem.stockreceived,
                }

                console.log('WRITE NEW TO BACKEND');
                return fetch('http://localhost:3000/insertreceived', {
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
        
            setReceived(this._received);
            setReceiveDialog(false);
            setReceiveitem(emptyReceived);  
    }

    const confirmDeleteReceivedItem = (receiveitem) => {
        setReceiveitem(receiveitem);
        setDeleteReceiveDialog(true);
    }

//NEXT SECTION TO MAKE IT WORK
    const deleteReceivedItem = () => {
        let _received = received.filter(val => val.id !== receiveitem.id);
        setReceived(_received);
        setDeleteReceiveDialog(false);
        setReceiveitem(emptyReceived);
        const input = {
            id: receiveitem.id
        }
        console.log('DELETE FROM BACKEND');

                return fetch('http://localhost:3000/deletereceived', {
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

    const deleteSelectedReceived = () => {
        let _received = received.filter(val => !selectedReceived.includes(val));
        setReceived(_received);
        setDeleteReceivedDialog(false);
        setSelectedReceived(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Transaction Deleted', life: 3000 });
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _receiveitem = { ...receiveitem };
        _receiveitem[`${name}`] = val;

        setReceiveitem(_receiveitem);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Receive Stock" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={openNew} />
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

    const stockreceivedBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Processed</span>
                {rowData.stockreceived}
            </>
        );
    }
    

    const receiveddateBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Processed Date</span>
                {formatDate(rowData.receiveddate)}
            </>
        );
    }
    
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteReceivedItem(rowData)} />
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

    const receivedDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveReceived} />
        </>
    );
    const deleteReceivedItemDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteReceivedItemDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteReceivedItem} />
        </>
    );
    const deleteReceivedDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteReceivedDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedReceived} />
        </>
    );

    return (
        <div className="p-grid crud-demo">
            <div className="p-col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable ref={dt} value={received} selection={selectedReceived} onSelectionChange={(e) => setSelectedReceived(e.value)}
                        dataKey="id" paginator rows={25} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter} emptyMessage="No products found." header={header}>
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="code" header="Code" sortable body={codeBodyTemplate} sort={true} ></Column>
                        <Column field="stockreceived" header="Stock Received" sortable body={stockreceivedBodyTemplate}></Column>
                        <Column field="receiveddate" header="Received Date" sortable body={receiveddateBodyTemplate}></Column>
                        
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={receiveDialog} style={{ width: '450px' }} header="PROCESS STOCK" modal className="p-fluid" footer={receivedDialogFooter} onHide={hideDialog}>
                        <div className="p-field">
                            <label htmlFor="code">Code</label>
                            <InputText id="code" value={receiveitem.code} onChange={(e) => onInputChange(e, 'code')} required autoFocus className={classNames({ 'p-invalid': submitted && !receiveitem.code })} />
                            {submitted && !receiveitem.code && <small className="p-invalid">Code is required.</small>}
                            
                            <label htmlFor="stockreceived">Stock Received in KG's</label>
                            <InputText id="stockreceived" value={receiveitem.stockreceived} onChange={(e) => onInputChange(e, 'stockreceived')} required />
                            
                            
                        </div>

                    </Dialog>

                    <Dialog visible={deleteReceiveDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteReceivedItemDialogFooter} onHide={hideDeleteReceivedItemDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                            {receiveitem && <span>Are you sure you want to delete <b>{receiveitem.name}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteReceivedDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteReceivedDialogFooter} onHide={hideDeleteReceivedDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                            {receiveitem && <span>Are you sure you want to delete the selected transaction?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
