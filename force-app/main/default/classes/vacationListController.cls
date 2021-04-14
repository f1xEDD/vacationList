public with sharing class vacationListController {
    
    @AuraEnabled
    public static List<Vacation_Request__c> getUserVacationRequests(){
        return [SELECT Id, CreatedBy.Name, CreatedBy.Id,  Name, Manager__r.Name, StartDate__c, RequestType__c, Manager__c, EndDate__c, WorkingDays__c, Status__c 
                FROM Vacation_Request__c
                WHERE CreatedBy.Id =: UserInfo.getUserId()
                ORDER BY Status__c];
    }

    @AuraEnabled
    public static void removeVacationRequest(String idToRemove){
        Vacation_Request__c vacationRequest= [SELECT Id, CreatedBy.Name, CreatedBy.Id,  Name, Manager__r.Name, StartDate__c, RequestType__c, Manager__c, EndDate__c, WorkingDays__c, Status__c 
                FROM Vacation_Request__c
                WHERE CreatedBy.Id =: UserInfo.getUserId() and Id=: idToRemove];

        delete vacationRequest;
    }

    @AuraEnabled
    public static void approveVacationRequest(String idToApprove){
        Vacation_Request__c vacationRequest= [SELECT Id, CreatedBy.Name, CreatedBy.Id,  Name, Manager__r.Name, StartDate__c, RequestType__c, Manager__c, EndDate__c, WorkingDays__c, Status__c 
                FROM Vacation_Request__c
                WHERE CreatedBy.Id =: UserInfo.getUserId() and Id=: idToApprove];

        vacationRequest.Status__c = 'Approved';
        
        update vacationRequest;
    }

    @AuraEnabled
    public static void submitVacationRequest(String idToSubmit){
        Vacation_Request__c vacationRequest= [SELECT Id, CreatedBy.Name, CreatedBy.Id,  Name, Manager__r.Name, StartDate__c, RequestType__c, Manager__c, EndDate__c, WorkingDays__c, Status__c 
                FROM Vacation_Request__c
                WHERE CreatedBy.Id =: UserInfo.getUserId() and Id=: idToSubmit];

        vacationRequest.Status__c = 'Submitted';
        
        update vacationRequest;
    }
    
    @AuraEnabled
    public static List<Vacation_Request__c> getVacationRequests(){
        return [SELECT Id, CreatedBy.Name, CreatedBy.Id,  Name, Manager__r.Name, StartDate__c, RequestType__c, Manager__c, EndDate__c, WorkingDays__c, Status__c 
                FROM Vacation_Request__c
                ORDER BY Status__c];
    }

    @AuraEnabled
    public static void addVacationRequest(String type, String sDate, String eDate, User user){

        date startDate = date.valueOf(sDate);
        date endDate = date.valueOf(eDate);

        Vacation_Request__c vacationRequest = new Vacation_Request__c();
        
        vacationRequest.Manager__c = user.Manager.Id;
        vacationRequest.Name = type + ' ' + user.Id + ' ' + startDate;
        vacationRequest.StartDate__c = startDate;
        vacationRequest.EndDate__c = endDate;
        vacationRequest.WorkingDays__c = countWorkingDays(startDate, endDate);
        vacationRequest.RequestType__c = type;
        vacationRequest.Status__c = 'New';

        try{
            insert vacationRequest;
        }
        catch (Exception e){
            System.debug('Error: ' + e);
        }

    }

    @AuraEnabled(cacheable=true)
    public static User getCurrentUser(){
        return [SELECT Id, Name, Manager.Id FROM User WHERE Id =: UserInfo.getUserId()];
    }

    @AuraEnabled
    public static Integer countWorkingDays(date startDate, date endDate){ 
        Integer count = 0;
        
        while(startDate <= endDate){
            Integer dayOfWeek = Math.mod(Date.newInstance(1900, 1, 7).daysBetween(startDate),7);
            if (!(dayOfWeek == 6 || dayofWeek == 0))
                count++;
            startDate = startDate.addDays(1);
        }

        return count;
    }

}