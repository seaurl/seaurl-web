'use client'
import React, { useRef } from 'react';
import { DocumentEditor } from "@onlyoffice/document-editor-react";



const OnlyOffice = () => {

    var onDocumentReady = function (event) {
        console.log("Document is loaded");
    };

    var onLoadComponentError = function (errorCode, errorDescription) {
        switch(errorCode) {
            case -1: // Unknown error loading component
                console.log('-----------1-----------',errorDescription);
                break;

            case -2: // Error load DocsAPI from http://documentserver/
                console.log('-----------2-----------',errorDescription);
                break;

            case -3: // DocsAPI is not defined
                console.log('-----------3-----------',errorDescription);
                break;
        }
    };

    return <div className={'h-full w-full'}>
        <DocumentEditor
            id="docxEditor"
            documentServerUrl="https://onlyoffice.seaurl.com"
            config={{
                "document": {
                    "fileType": "docx",
                    "key": "Khirz6zTPdfd7",
                    "title": "工作计划.xlsx",
                    "url": "https://cdn.seaurl.com/space/file/65572750cd854b7c35b26936/工作计划.xlsx"
                },
                "documentType": "word",
                "editorConfig": {
                    "callbackUrl": "https://cdn.seaurl.com"
                }
            }}
            events_onDocumentReady={onDocumentReady}
            onLoadComponentError={onLoadComponentError}
        />    </div>
}

export default OnlyOffice