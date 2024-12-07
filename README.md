# Requirement Documentation - Gearshare

## Introduction
This document provides a comprehensive overview of the project aimed at enhancing the data management system for Maine GearShare.

| **Category**               | **Description**                                                                                  |
|----------------------------|--------------------------------------------------------------------------------------------------|
| **Project Background** | Maine GearShare, a local equipment rental company that also provides repair services, faces several operational challenges due to its rapid growth. Currently, accessing information between Booqable and Airtable requires users to switch between platforms, leading to inefficiencies in workflow. Additionally, Booqable’s email capabilities are limited to its predefined templates, restricting the ability to send customized and automated communications. Although Zapier automates some processes, many tasks still require manual intervention. As a result, Gear Share is seeking to develop an integrated software solution to streamline workflows, enhance automation, and improve overall service efficiency. |
| **Scope**                | This project focuses solely on enhancing the software layer and will not address any issues related to hardware.  |
| **Objective**                | This project will develop a comprehensive solution to enable the company to manage all its services with additional functionalities.  |
| **System Environments**                | This project will deliver a prototype that operates seamlessly on both web and iOS platforms.  |
| **Product Perspective**                | The end product of this project will be a prototyping software that integrates the current services provided by Airtable and Booqable. It will enable users to track inventory and manage repair records more efficiently with additional functions.   |
|**Constraints**              | This project will deliver a prototype only and will not include any future maintenance or updates. Additionally, the prototype may not fully replace the existing system initially and may require further modifications to achieve complete functionality. On our initial release version, all the data shown is linked to mock Airtable & Booqable accounts and databases to purely demonstrate functionality.   |

## Stakeholders

| **Name**                        | **Role**            | **Email**                          |
|---------------------------------|---------------------|------------------------------------|
| Josh Bossin                     | Gearshare           | josh@mainegearshare.org            |
| Emily Mackeown                  | Gearshare           | emily@mainegearshare.org           |
| Kevin Chen                      | Development Team    | chen.kevin4@northeastern.edu       |
| Comus Hardman                   | Development Team    | hardman.c@northeastern.edu         |
| Vageesh Kudutini Ramesh         | Development Team    | kudutiniramesh.v@northeastern.edu  |
| Yixiao Wu                       | Development Team    | wu.yixia@northeastern.edu          |

## Functional Requirements

| **Function**                      | **Description**                                                                                                    |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **Data Management and Integration** | The management system will collect all data from Airtable and Booqable and ensure data synchronization between both platforms. Users will be able to view inventory, rental records, add and edit repair tickets and user information through the system. |
| **Web App & iOS App**              | The web app and iOS app will provide a consistent experience and functionality with full data synchronization between platforms. |
| **Automatic Processes**            | The management system will automate various customer service processes, including data migration, information synchronization, quoting the services, and report generation. Emails sent to users will be automatically generated using a customized template that can be edited by the user. A chatbot feature will also be added to support customer service interactions. Additionally, customer payments will be managed automatically by the system. |
| **User Management**                | The management system will support various user roles with different levels of authorization. Users will be able to view and edit their personal information based on their assigned permissions. |

## Nonfunctional Requirements

| **Function**               | **Description**                                                                                  |
|----------------------------|--------------------------------------------------------------------------------------------------|
| **User-Friendly Interface** | The product will feature a graphical interface that only requires basic skills such as clicking and typing. |

## Technology Stack

| **Layer** | **Description**                                                                                                   |
|---------------|-------------------------------------------------------------------------------------------------------------------|
| **Frontend**  | The web interface and iOS app will provide users with access to all functionalities of the management system.      |
| **Middleware**| The information syncing process will collect and integrate data from Airtable and Booqable through their APIs.     |
| **Backend**   | The initial development is designed to use Airtable to store user, inventory, and repair data.                     |

## Data Model

The data model for this project is structured around five primary components: Users, Activity Logs, Repair Tickets, and Rental Records. Data will be interconnected and shared across these components through unique identifiers.

## Acceptance Criteria

| **Feature**                    | **Description**                                                                                                   |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------|
| **User Management**            | Users can register and log in using a username and password. Once users create an account, their user profile will be created.
| **Data Integration**           | The system can collect data from both Airtable and Booqable, ensuring seamless information synchronization across platforms. |
| **Equipment Management**       | Users can view the status and pricing of equipment. Any attribute changes will be reflected on the activity log.|
| **Rental Management**          | Users can view equipment records with certain services being more automated. Any changes to attributes will be automatically synchronized with Airtable and Booqable. |
| **Repair Ticket Management**   | Bi-directional sync between webapp, and mobile app, users can add, edit, or view repair tickets with changes reflected in realtime on Airtable.|
| **Auto Email Templates**       | Webapp allows you to create email templates to send when a repair ticket is created, and when that repair ticket is marked as completed. |

## API

| **API**               | **Description**                                                                                                       |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Airtable API**      | This API can be used to integrate data in Airtable with any external system. [Introduction - Airtable Web API](https://airtable.com/api) |
| **Booqable API**      | This API can be used to view and edit information from Booqable. [Introduction – Booqable API](https://booqable.com/api) |

# Release


## Downloads

Windows Port: [https://mega.nz/file/5qETyJwA#vvRL0C0S77A4GNLJrDs5IRbnpy7-PCCqNdKWFzk4SEA](https://mega.nz/file/128WkRLC#nplBzJ2LZa0qOTNgDS8YFXcgaBuV1eQ6Vr4-Tdj57AM)
(Tested and working on Windows 10 & 11)

MacOS Port: [https://mega.nz/file/UvVCDa7Z#g1ACySbnSzif9FhNJMadgEqe7qegQ4fkaa9Vi7M-Am4](https://mega.nz/file/Z7VCDKxK#o4dlJmgQEKjMGVyqi92N38LA6leDsrR8aPaIdw6MDc0)
(Tested and working on macOS Sequoia ver 15.1.1)

### First time setup/installation instructions (MacOS)

This setup only needs to be completed once; a "GearShareLauncher" file will be created on your desktop which you can double click to run for all future uses.

1. Download the MacOS Port from above.

2. Right click -> Open with -> Archive Utility

3. Open terminal via Spotlight Search (Command + Space)

4. cd into the new folder that was created. So, if you downloaded the .zip into your Downloads folder, you should do {cd Downloads} (These commands are case-sensitive)

5. cd into the "CS5500-GearShare" folder (cd CS5500-GearShare)

6. Run this command to give the webapp launcher execution commands: chmod +x installwebapp.sh

7. Run ./installwebapp.sh . This will create a launcher for the webapp on your desktop.

9. You will see terminal open, installing various dependencies for the webapp to work. When it's complete, the webapp will be launched in your default browser.

10. Some users may experience a blank screen upon loading, wait a few seconds and refresh will fix it.

### First time setup/installations instructions (Windows)

1. Unzip the downloaded archive

2. Open the CS5500-Gearshare folder.

3. Right click "launch gearshare webapp" -> Run as administrator

4. You may receive warnings from antivirus, this is due to the auto installation script being marked as a virus - you can safely ignore.

## Presentation Link
https://www.canva.com/design/DAGX1dMnTW8/Gb5ZxvfXZS-GevnBYfR5pA/edit
