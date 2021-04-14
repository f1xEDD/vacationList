import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getVacationRequests from '@salesforce/apex/vacationListController.getVacationRequests';
import removeVacationRequest from '@salesforce/apex/vacationListController.removeVacationRequest'
import submitVacationRequest from '@salesforce/apex/vacationListController.submitVacationRequest'
import approveVacationRequest from '@salesforce/apex/vacationListController.approveVacationRequest'
import getUserVacationRequests from '@salesforce/apex/vacationListController.getUserVacationRequests';
import addVacationRequest from '@salesforce/apex/vacationListController.addVacationRequest';
import getCurrentUser from '@salesforce/apex/vacationListController.getCurrentUser';

export default class VacationList extends LightningElement {

    openModal = false;

    @track modalItemsValues = {};
    @track vacationRequests;
    @track error;
    @track currentUser;
    @track data;
    @track onlyMyToggler;
    _title = 'Success!';
    _message = 'Request successfully created!';
    _variant = 'success';



    connectedCallback(){
        getCurrentUser()
            .then(result => {
                this.currentUser = result;
            })
            .catch(error => {
                this.error = error;
            });

        this.loadVacationRequests();
    }

    handleCreate(){
        try{
            addVacationRequest({type: this.modalItemsValues['typeInput'], sDate: this.modalItemsValues['dateInput1'], eDate: this.modalItemsValues['dateInput2'], user: this.currentUser})
                .then(results => {
                    this.data = results;
                    this.loadVacationRequests();
                })
                .catch(error => {
                    this.error = error.body.message;
                    console.log(error);
                });


            this.openModal = false;
            
            this._title = 'Success!';
            this._message = 'Request successfully created!';
            this._variant = 'success';

            this.showNotification();
        }
        catch{
            this.openModal = false;

            this._title = "Error!";
            this._message = 'Manager for current user isn’t specified!';
            this._variant = 'error';

            this.showNotification();
        }
    }

    handleApprove(event){
        let idToApprove = event.target.name;

        let requestToApprove = this.vacationRequests.find(item => item.e.Id === idToApprove);
        
        if(requestToApprove.e.Manager__c == this.currentUser.Id){
            approveVacationRequest({idToApprove: idToApprove})
                .then(result => {
                    console.log("Approved");

                    this._title = 'Success!';
                    this._message = 'Request successfully approved!';
                    this._variant = 'success';

                    this.showNotification();

                    this.loadVacationRequests();
                    
                })
                .error(error => {
                    this.error = error;
                }) 
        }
        else{
            this._title = "Error!";
            this._message = 'You are not this user\'s manager!';
            this._variant = 'error';

            this.showNotification();
        }


    }

    handleRemove(event){
        let idToRemove = event.target.name;

        removeVacationRequest({idToRemove: idToRemove})
            .then(result => {
                console.log("Deleted");

                this._title = 'Success!';
                this._message = 'Request successfully removed!';
                this._variant = 'success';

                this.showNotification();

                this.loadVacationRequests();
            })
            .error(error => {
                this.error = error;
            })
    }

    handleSubmit(event){
        let idToSubmit = event.target.name;

        submitVacationRequest({idToSubmit: idToSubmit})
            .then(result => {
                console.log("Submitted");
                
                this._title = 'Success!';
                this._message = 'Request successfully submitted!';
                this._variant = 'success';

                this.showNotification();

                this.loadVacationRequests();
            })
            .error(error => {
                this.error = error;
            })
    }

    loadVacationRequests(){
        getVacationRequests()
            .then(result => {
                this.vacationRequests = result;

                var mapResult=result;

                mapResult = mapResult.map(e => ({
                    e: e,
                    statusNew: e.Status__c  == 'New' ? true : false,
                    statusSubmitted: e.Status__c == 'Submitted' ? true : false,
                    statusApproved: e.Status__c == 'Approved' ? true : false
                }));

                this.vacationRequests = mapResult;

                console.log(this.vacationRequests);
            })
            .catch(error => {
                this.error = error;
            });
    }

    loadUserVacationRequests(){
        getUserVacationRequests()
            .then(result => {
                this.vacationRequests = result;

                var mapResult=result;

                mapResult = mapResult.map(e => ({
                    e: e,
                    statusNew: e.Status__c  == 'New' ? true : false,
                    statusSubmitted: e.Status__c == 'Submitted' ? true : false,
                    statusApproved: e.Status__c == 'Approved' ? true : false
                }));

                this.vacationRequests = mapResult;
            })
            .catch(error => {
                this.error = error;
            })
    }

    handleOnlyMy(event){

        this.onlyMyToggler = event.target.checked;
        
        this.onlyMyToggler ? this.loadUserVacationRequests() : this.loadVacationRequests();
    }

    showNotification(){
        const evt = new ShowToastEvent({
            title: this._title,
            message: this._message,
            variant: this._variant
        });
        this.dispatchEvent(evt);
    }

    onModalItemsChange(event){
        this.modalItemsValues[event.target.name] = event.target.value;
    }

    handleOpenModal(){
        this.openModal = true;
    }

    handleCloseModal(){
        this.openModal = false;
    }
}