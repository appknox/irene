# Request Edit Analysis \- Members/Admins

## Overview

Currently only Owners can use the Edit Analysis feature. We are now enhancing this to let other users roles Members and Admins to also leverage Edit Analysis by raising a request. This is applicable for changing the severity as well as Ignoring the vulnerability.

Note: Pls check if Admins already have access to Edit Analysis, if yes, then this enhancement is only applicable for Members.

## Key Requirements

**Org level toggle **

- Add an org level toggle for Owners to enable this capability for their org, which is disabled by default

**Raising a request**

- Members will also see an option to raise a request for altering the severity of an issue, across projects they have access to.

- On click of this, a side bar opens where the Member can add the relevant details to raise the request for the override.  

  
**Approving a request**

- After filling all the details and clicking on Raise Request, an in app notification will be sent to all Owners of that Org for review.  

- On click of view vuln details either from the In app notification or from the email notification, they get redirected to that vuln page as seen below with an option to approve or reject the request for override. Note that the below screen will also be accessible if an Owner is viewing the vuln details directly, and not via the in app notification.  

  
- Once Approved, the view of the overridden vulnerability looks like below when clicking on Edit Analysis icon. 
    - The below view is for members, where they don’t see an option to reedit it or to reset it back to its original severity.
    - 
    - However, Admins (if they have access to Edit Analysis in the current version of the feature live in prod) & Owners can continue to re Edit and Reset Override.  
- Also, if a request has been approved by an Owner, then, trigger in app notifications to all other owners notifying them of an approval. In addition, send an in app notification the requestor i.e. the member as well.  
- Once a request has been approved by one of the Owners the other owners should not be able to see the option to Approve or Reject for that same vulnerability, when they are accessing the Vuln details from the in app notification.
- For all such vulns where override request has been accepted, then the PDF report will also reflect the same as per the design below. \<TBD\>  

**Viewing a request**  
Once a request has been submitted by a Member for review, when they click on the Edit analysis icon for that vulnerability, they can see the details as per the image below in this section.  
  
Also, if a vulnerability has been submitted for a review, then for that same vulnerability under that same File ID cannot be, no other member can raise a request while the original one is still under review. In such instances, other members also see the same UI.  


**Rejecting a Request**

- If an owner rejects the override request, then they will have to enter the reason for rejection before being able to decline that request.  
  
- In such cases, the member who raised a request will get an in app notification along with the reason for rejection. Rejection details will not be visible in the vuln details page.  
- Once rejected, any other member can reraise a request for that vulnerability in the future.

**Report Changes:**

- Wherever we currently show that Edit Analysis audit details in the report, in that same section we also need to mention who approved the override, in cases where an override was requested by a member and approved by an Owner.

**Past Files:**

For the sake of simplicity, the capability to request overrides can be enabled only for Files uploaded after the release of this feature into production and from the time the Org level toggle to enable this feature is turned on.  
  
**Figma (Draft)**

 <https://www.figma.com/proto/vo5WHoyb7ihPhTfzCJSunz/Appknox-Product-Design?page-id=19693%3A57858&node-id=33848-33444&viewport=-2763%2C3217%2C0.62&t=FsYGPtrlInLlQJ0a-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=33848%3A33444&show-proto-sidebar=1>
