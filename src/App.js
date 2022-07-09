import React, { Component } from "react";

import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";

import Header from "./components/header"
import UserManagementPage from "./components/userManagementPage";
import MainPage from "./components/mainPage";
import ViewFile from "./components/viewFile";
import CopyMoveToast from "./components/copyMoveToast";
import {copyBufferAddListener, copyBufferRemoveListener, isCopyBufferEmpty, popCopyBuffer, peekCopyBuffer} from "./lib/copyBuffer";


class App extends Component {
  state={
    searchString:"",
    page:"Main",
    filename:"",
    blob: null,
    showToast:"",
    copyMoveOperaion:"move",
    accountData:{}

  }
  
  constructor(props) {
    super(props);
    this.mainPageRef = React.createRef();
  }

  componentDidMount = () => {
    copyBufferAddListener(this.copyBufferEvent);
  };

  componentWillUnmount = () => {
    copyBufferRemoveListener(this.copyBufferEvent);
  };

  copyBufferEvent = () => {
    const entry = peekCopyBuffer();
    if(entry) {
      this.setState({showToast: "CopyToast", copyMoveOperaion:entry.operation});
    } else {
      this.setState({showToast: ""});
    }
  }

  onCopyToastClose = () => {
    popCopyBuffer();
  }

  gotoMain = () => {
    this.setState({
      page:"Main",
      filename:"",
      blob: null,
    })
  }

  gotoIam = () => {
    this.setState({
      page:"Iam",
      filename:"",
      blob: null,
    })
  }

  updateAccountData = (data) => {
    this.setState({accountData:data})
  }
  onSearchStringChange = searchString => {
    this.setState({searchString:searchString.trim()})
  }
  onAccountMenuCommand = cmd => {
    this.mainPageRef.current.onAccountMenuCommand(cmd);
  }
  inMemoryView = (blob, filename) => {
    this.setState({page: "ViewFile", filename, blob})
    console.log("inMemory view", filename);
  }

  render () {
    return (
      <Container className='d-flex' style={{flexDirection: "column"}}>
        <Header 
        onSearchChange={this.onSearchStringChange} 
        searchString = {this.state.searchString}
        mainPage = {this.state.page=="Main"} 
        onAccountMenuCommand={this.onAccountMenuCommand}
        accountData={this.state.AccountData}
        gotoMain={this.gotoMain}
        gotoIam={this.gotoIam}
        />

        <Row className="mainRow">
          <ViewFile 
            show= {this.state.page == "ViewFile"}
            gotoMain={this.gotoMain} 
            filename={this.state.filename} 
            blob = {this.state.blob}/>

          <MainPage 
            show={this.state.page=="Main"}
            inMemoryView={this.inMemoryView}
            searchString = {this.state.searchString} 
            onSearchClear = {() => this.onSearchStringChange('')}
            updateAccountData={this.updateAccountData} 
            ref={this.mainPageRef}/>

          <UserManagementPage 
            show={this.state.page=="Iam"}
            gotoMain={this.gotoMain}
          />
        </Row>
        <Row className="d-none d-sm-block">
          <div style={{height:"3em", display: this.state.page == "Main"? '':"none"}}></div>
        </Row>
        <CopyMoveToast
        show={this.state.showToast === "CopyToast"}
        operation={this.state.copyMoveOperaion}
        onClose={this.onCopyToastClose}
      ></CopyMoveToast>

      </Container>
    
    );
  }
}

export default App;
