import React, { useContext, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import ProgressBar from 'react-native-progress/Bar';
import { ProjectContext } from './contexts/ProjectContext';
import { SET, NO_DEVICE, ERROR, OK_DEVICE } from './actions/action';
import Prompt from 'react-native-input-prompt';


function NewProject({ navigation, initProject }) {
    const [progress, setProgress] = useState(0)
    const [loaded, setLoaded] = useState(false)
    const [inputname, setInputname] = useState(false)
    const { dispatch } = useContext(ProjectContext)
    const webViewRef = useRef()
    const projectContext = useContext(ProjectContext)

    const clearLastProject = 'window.localStorage.clear();'
    const injectProjectBeforeLoad = initProject ? `window.localStorage.setItem('initxml', '${initProject.data}');` : ``;

    const handleOnMessage = (message) => {
        try {
            var messageObj = JSON.parse(message);
            switch (messageObj.REQUEST) {
                case "UART":
                    if (!projectContext.stateProj.connected) {
                        dispatch({ type: NO_DEVICE })
                        return;
                    }
                    let oldState = projectContext.stateProj;
                    projectContext.setStateProj({ ...oldState, sendText: messageObj.DATA, isSend: true })
                    break;
                case "SAVE":
                    if (!initProject) {
                        setInputname(messageObj.DATA);
                    }
                    else {
                        dispatch({ type: SET, project: { name: initProject.name, data: messageObj.DATA, _id: initProject._id } })
                    }
                    break;
                case "CHECK":
                    if (!projectContext.stateProj.connected) {
                        dispatch({ type: NO_DEVICE })
                    }
                    else {
                        dispatch({ type: OK_DEVICE })
                    }
                    break;
            }
        }
        catch (e) {
            dispatch({ type: ERROR })
        }
    }


    const INJECTED_JAVASCRIPT = `(function() {
    ${clearLastProject}
    window.ReactNativeWebView.postMessage('init');
    ${injectProjectBeforeLoad}
    window.ReactNativeWebView.postMessage('done');
    })();`;


    return (
        <>
            {!loaded && <ProgressBar
                progress={progress}
                width={null}
                borderRadius={0}
                borderWidth={0}
                color='orange'
            />}

            {inputname && <Prompt
                visible={true}
                title="Nhập tên chương trình"
                placeholder="Chương trình của tôi"
                onCancel={() => { setInputname(false) }}
                onSubmit={(value) => {
                    dispatch({ type: SET, project: { name: value, data: inputname } })
                }}
                cancelText={"Huỷ"}
                submitText={"Tiếp tục"}
            />}
            <WebView
                ref={webViewRef}
                source={{
                    uri: 'file:///android_asset/static/index.html',
                }}
                onMessage={(event) => {
                    handleOnMessage(event.nativeEvent.data);
                }}
                onLoadProgress={({ nativeEvent }) => {
                    setProgress(nativeEvent.progress);
                }}
                onLoadEnd={() => setLoaded(true)}
                injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
                incognito={true}
            />

        </>
    );
}

export default NewProject;