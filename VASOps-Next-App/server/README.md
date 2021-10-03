# VasOps Backend Api

 ## This project uses Node.js, Express, with sql Api and CosmosdB for Storage
 
 ## Prerequisities 
>> This sample project uses:
+ [Azure Cosmos db Emulator ](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator?tabs=cli%2Cssl-netstd21)
+ [Microsoft Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator)
+ [Azure Storage Explorer](https://azure.microsoft.com/en-us/features/storage-explorer/)

Install the software mentioned above by clicking the link.

N.B. If an Error regarding the abscense of "LocalDB" is returned upon running the installed Storage Emulator Software:

   >> See:
    + [SQL Server Express LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb?view=sql-server-ver15)

    >> Upon navigating to the link provided above :
        + Click the link provided on that page to download the SQL Server Express 2019.
        + Once downloaded open the Application and Upon being prompted to Select an Installation type, choose "Download Media", then select the "LocalDB" package.
        + Once downloaded check the folder destination for an msi file named, "SQLLocalDB" and click to install.
        + When finished, re-open the Azure Storage Emulator App and await confirmation of Success startup. 

        

To view information Stored in Cosmos db Emulator & Azure Storage Emulator download [Microsoft Azure Storage Explorer](https://azure.microsoft.com/en-us/features/storage-explorer/)


 ## Setup
>> Instructions to Run the Sample:
 1) Clone the repository:
 - `https://dev.azure.com/Digicel-DevOps/JAM_VAS_Applications/_git/VASOps`
 2) Using a CMD terminal navigate (command: 'cd') into the server folder.
 3) Install dependencies using:`npm i or npm install`
 4) Start the Server using the command, `npm start`
 
 
