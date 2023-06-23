import React from "react";
import LocalForage from "localforage";
import Alert from "react-bootstrap/Alert";

import DashBkgd from "./Images/dash_digital-cash_logo_2018_rgb_for_screens.png";
import Image from "react-bootstrap/Image";

import TopNav from "./Components/TopNav/TopNav";
import BottomNav from "./Components/BottomNav/BottomNav";
import LoginBottomNav from "./Components/BottomNav/LoginBottomNav";

import LandingPage from "./Components/Pages/LandingPage";
import ConnectedWalletPage from "./Components/Pages/ConnectedWalletPage";

import Footer from "./Components/Footer";
import PaymentAddrComponent from "./Components/PaymentAddrComponent";
import TxHistoryComponent from "./Components/TxHistoryComponent";

import LoginSignupModal from "./Components/TopNav/LoginSignupModal";
import LogoutModal from "./Components/TopNav/LogoutModal";
import ConfirmPaymentModal from "./Components/Pages/ConfirmPaymentModal";
import RegisterDGMModal from "./Components/BottomNav/BottomNavModalFolder/RegisterDGMModal";
import TopUpIdentityModal from "./Components/BottomNav/BottomNavModalFolder/TopUpModal";

import "./App.css";

const Dash = require("dash");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      isLoading: false,
      isLoadingConfirmation: false,
      isLoadingButtons: false,
      isLoadingForm: false,

      mode: "dark",
      presentModal: "",
      isModalShowing: false,
      whichNetwork: "testnet",

      mnemonic: "",

      accountBalance: "",
      accountAddress: "", 
      accountHistory: "",
      dgmDocuments: [],

      identity: "",
      identityInfo: "",
      uniqueName: "",

      sendToName: "",
      sendToAddress: "",
      amountToSend: 0,

      sendSuccess: false,
      sendFailure: false,
      nameSuccess: "",
      amtSuccess: 0,

      skipSynchronizationBeforeHeight: 883000,
      expandedTopNav: false,
    };
  }


  closeExpandedNavs = () => {
    this.setState({
      expandedTopNav: false,
    });
  };

  toggleExpandedNav = (selectedNav) => {
    if (this.state.expandedTopNav) {
      this.setState({
        expandedTopNav: false,
      });
    } else {
      this.setState({
        expandedTopNav: true,
      });
    }
  };

  hideModal = () => {
    this.setState({
      isModalShowing: false,
    });
  };

  showModal = (modalName) => {
    this.setState({
      presentModal: modalName,
      isModalShowing: true,
    });
  };

  showConfirmModal = (inputName, inputNumber, paymentAddress) => {
    this.setState(
      {
        sendSuccess: false,
        sendFailure: false,
        sendToName: inputName,
        amountToSend: Number(inputNumber).toFixed(3),
        sendToAddress: paymentAddress,
        presentModal: "ConfirmPaymentModal",
        isModalShowing: true,
      },
      () => {
        console.log(this.state.sendToName);
        console.log(this.state.amountToSend);
      }
    );
  };

  handleMode = () => {
    if (this.state.mode === "primary")
      this.setState({
        mode: "dark",
      });
    else {
      this.setState({
        mode: "primary",
      });
    }
  };

  handleSkipSyncLookBackFurther = () => {
    this.setState(
      {
        skipSynchronizationBeforeHeight:
          this.state.skipSynchronizationBeforeHeight - 5000,
        isLoading: true, 
      },
      () => this.handleLoginforRefreshWallet()
    );
  };

  handleLogout = () => {
    this.setState({
      isLoggedIn: false,
      isLoading: false,
      isLoadingConfirmation: false,
      isLoadingButtons: false,
      isLoadingForm: false,
      presentModal: "",
      isModalShowing: false,
      mnemonic: "",
      accountBalance: "",
      accountAddress: "",
      accountHistory: "",
      identity: "",
      identityInfo: "",
      uniqueName: "",
      dgmDocuments: [],
      sendToName: "",
      amountToSend: 0,
      paymentAddress: "",
      sendSuccess: false,
      sendFailure: false,
    });
  };

  updateCreditsAfterTopUp = (identInfo) => {
    this.setState({
      identityInfo: identInfo,
      isLoadingButtons: false,
      isLoadingConfirmation: false,
      isLoadingForm: false,
      accountBalance: this.state.accountBalance - 1000000,
    });
  };

  triggerTopUpEndLoadingsAfterFail = () => {
    this.setState({
      isLoadingButtons: false,
      isLoadingConfirmation: false,
      isLoadingForm: false,
    });
  };

  triggerTopUpLoading = () => {
    this.setState({
      isLoadingButtons: true,
      isLoadingConfirmation: true,
      isLoadingForm: true,
    });
  };

  componentDidMount() {
    LocalForage.config({
      name: "dashevo-wallet-lib",
    });

    LocalForage.keys()
      .then(function (keys) {
        console.log(keys);
      })
      .catch(function (err) {
        console.log(err);
      });

    LocalForage.ready()
      .then(function () {
        console.log(LocalForage.driver()); // LocalStorage
      })
      .catch(function (e) {
        console.log(e); 
      });
  }

  handleLoginwithMnem = (theMnemonic) => {

    this.setState(
      {
        isLoggedIn: true,
        isLoading: true,
        isLoadingButtons: true,
        identity: "Retrieving Identity",
        mnemonic: theMnemonic,
      },
      () => this.getIdentitywithMnem(theMnemonic)
      
    );
  };

  handleFormClearThenRefresh = () => {
    document.getElementById("Pay-to-Name-form").reset();
    this.handleLoginforRefreshWallet();
  };

  handleLoginforRefreshWallet = () => {
    this.setState({
      isLoadingConfirmation: true,
      isLoadingButtons: true,
    });

    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();

      this.setState({
        accountBalance: account.getTotalBalance(),
        accountAddress: account.getUnusedAddress().address, 
        accountHistory: account.getTransactionHistory(),
      });

      return account;
    };

    retrieveIdentityIds()
      .then((d) => {
        this.setState({
          isLoadingConfirmation: false,
          isLoadingButtons: false,
          isLoading: false, 
        });
      })
      .catch((e) => {
        console.error("Something went wrong getting Wallet:\n", e);
        this.setState({
          isLoadingConfirmation: false,
          isLoadingButtons: false,
          isLoading: false, 
        });
      })
      .finally(() => client.disconnect());
  };

  getIdentitywithMnem = (theMnemonic) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: theMnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();

      console.log(account.getTotalBalance());
      // console.log(account.getUnusedAddress().address);
      console.log(account.getTransactionHistory());

      this.setState({
        //accountWallet: client, 
        accountBalance: account.getTotalBalance(),
        accountAddress: account.getUnusedAddress().address,
        accountHistory: account.getTransactionHistory(),
      });

      return account.identities.getIdentityIds();
    };

    retrieveIdentityIds()
      .then((d) => {
        console.log("Mnemonic identities:\n", d);
        if (d.length === 0) {
          this.setState({
            isLoading: false,
            identity: "No Identity",
          });
        } else {
          this.setState(
            {
              identity: d[0],
            }
            ,() => this.getIdentityInfo()
          );
        }
      })
      .catch((e) => {
        console.error("Something went wrong getting IdentityIds:\n", e);
        this.setState({
          isLoading: false,
          identity: "No Identity",
        });
      })
      .finally(() => client.disconnect());
  };

  getIdentityInfo = () => {
    console.log("Called get Identity Info");

    const client = new Dash.Client({
      network: this.state.whichNetwork,
    });

    const retrieveIdentity = async () => {
      return client.platform.identities.get(this.state.identity); // Your identity ID
    };

    retrieveIdentity()
      .then((d) => {
        console.log("Identity retrieved:\n", d.toJSON());
        let idInfo = d.toJSON();
        this.setState(
          {
            identityInfo: idInfo,
            
          },
          () => this.getNamefromIdentity(this.state.identity)
        );
      })
      .catch((e) => {
        console.error("Something went wrong in retrieving the identity:\n", e);
        this.setState({
          isLoading: false,
          identityInfo: "Load Failure", 
        });
      })
      .finally(() => client.disconnect());
  };

  getNamefromIdentity = (theIdentity) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
    });

    const retrieveNameByRecord = async () => {
      // Retrieve by a name's identity ID
      return client.platform.names.resolveByRecord(
        "dashUniqueIdentityId",
        theIdentity // Your identity ID
      );
    };

    retrieveNameByRecord()
      .then((d) => {
        let nameRetrieved = d[0].toJSON();
        console.log("Name retrieved:\n", nameRetrieved);
        this.setState(
          {
            uniqueName: nameRetrieved.label,
          },
          () => this.queryDGMDocument()
        );
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        console.log("There is no dashUniqueIdentityId to retrieve.");
        this.setState({
          isLoading: false,
          uniqueName: "Er",
        });
      })
      .finally(() => client.disconnect());
  };

  queryDGMDocument = () => {
    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        DGMContract: {
          contractId: 'DvFwMMxLRfPLp5bGK8D4CqaHME21iF7R9HnBnvf7Mk8g',
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const getDocuments = async () => {
      console.log("Called Query DGM Documents.");

      return client.platform.documents.get("DGMContract.dgmaddress", {
        where: [["$ownerId", "==", this.state.identity]],
      });
    };

    getDocuments()
      .then((d) => {
        let docArray = [];
        for (const n of d) {
          console.log("Document:\n", n.toJSON());
          docArray = [...docArray, n.toJSON()];
        }

        this.setState(
          {
            dgmDocuments: docArray,
          },
          () => this.endInitialLogin()
        );
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
          isLoading: false,
          isLoadingButtons: false,
          // End loading state
        });
      })
      .finally(() => client.disconnect());
  };

  endInitialLogin = () => {
    this.setState({
      isLoading: false,
      isLoadingButtons: false,
    });
  };

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  RegisterDGMAddress = () => {
    console.log("Called Register DGM Address");
    this.setState({
      isLoadingConfirmation: true,
      isLoadingButtons: true,
    });
    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        DGMContract: {
          contractId: 'DvFwMMxLRfPLp5bGK8D4CqaHME21iF7R9HnBnvf7Mk8g',
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const submitNoteDocument = async () => {
      const { platform } = client;
      const identity = await platform.identities.get(this.state.identity); // Your identity ID

      const docProperties = {
        address: this.state.accountAddress,
      };

      // Create the note document
      const dgmDocument = await platform.documents.create(
        "DGMContract.dgmaddress", 
        identity,
        docProperties
      );

      const documentBatch = {
        create: [dgmDocument], // Document(s) to create
        replace: [], // Document(s) to update
        delete: [], // Document(s) to delete
      };
      // Sign and submit the document(s)
      return platform.documents.broadcast(documentBatch, identity);
    };

    submitNoteDocument()
      .then((d) => {
        let returnedDoc = d.toJSON();
        console.log("Document:\n", returnedDoc);

        this.setState({
          dgmDocuments: [returnedDoc],
          isLoadingConfirmation: false,
          isLoadingButtons: false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
          isLoadingConfirmation: false,
          isLoadingButtons: false,
        });
      })
      .finally(() => client.disconnect());
  };

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  //FROM: https://dashpay.github.io/platform/Wallet-library/account/createTransaction/

  sendDashtoName = () => {
    this.setState({
      isLoadingButtons: true,
      isLoadingConfirmation: true,
      isLoadingForm: true,
    });

    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const payToRecipient = async () => {
      const account = await client.getWalletAccount();

      let dashAmt = this.state.amountToSend * 100000000;
      console.log("sats sent in TX:", dashAmt);
      console.log(typeof dashAmt);


      const transaction = account.createTransaction({
        recipient: this.state.sendToAddress,
        satoshis: dashAmt, 
      });
      //return transaction;//Use to disable TX
      return account.broadcastTransaction(transaction);
    };

    payToRecipient()
      .then((d) => {
        console.log("Payment TX:\n", d);

        this.setState(
          {
            isLoadingConfirmation: false,
            isLoadingButtons: false,
            isLoadingForm: false,
            sendSuccess: true,
          },
          () => this.handleFormClearThenRefresh()
        ); 
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          isLoadingConfirmation: false,
          isLoadingButtons: false,
          isLoadingForm: false,
          sendFailure: true,
        });
      })
      .finally(() => client.disconnect());
  };

  render() {
    this.state.mode === "primary"
      ? (document.body.style.backgroundColor = "rgb(280,280,280)")
      : (document.body.style.backgroundColor = "rgb(20,20,20)");

    this.state.mode === "primary"
      ? (document.body.style.color = "black")
      : (document.body.style.color = "white");

    return (
      <>
        <TopNav
          handleMode={this.handleMode}
          mode={this.state.mode}
          showModal={this.showModal}
          whichNetwork={this.state.whichNetwork}
          isLoggedIn={this.state.isLoggedIn}
          toggleExpandedNav={this.toggleExpandedNav}
          expandedTopNav={this.state.expandedTopNav}
        />

        <Image fluid="true" id="dash-bkgd" src={DashBkgd} alt="Dash Logo" />

        {!this.state.isLoggedIn ? (
          <>
            <LandingPage />
            <LoginBottomNav mode={this.state.mode} showModal={this.showModal} />
            <Footer />
          </>
        ) : (
          <>
            <ConnectedWalletPage
              handleSkipSyncLookBackFurther={this.handleSkipSyncLookBackFurther}
              sendFailure={this.state.sendFailure}
              sendSuccess={this.state.sendSuccess}
              mnemonic={this.state.mnemonic}
              whichNetwork={this.state.whichNetwork}
              skipSynchronizationBeforeHeight={
                this.state.skipSynchronizationBeforeHeight
              }
              dgmDocuments={this.state.dgmDocuments}
              isLoading={this.state.isLoading}
              isLoadingButtons={this.state.isLoadingButtons}
              isLoadingConfirmation={this.state.isLoadingConfirmation}
              isLoadingForm={this.state.isLoadingForm}
              accountBalance={this.state.accountBalance}
              accountAddress={this.state.accountAddress}
              identity={this.state.identity}
              identityInfo={this.state.identityInfo}
              uniqueName={this.state.uniqueName}
              showConfirmModal={this.showConfirmModal}
            />

            {this.state.sendSuccess ? (
              <>
                <p></p>
                <Alert variant="success" dismissible>
                  <Alert.Heading>Payment Successful!</Alert.Heading>
                  You have successfully sent{" "}
                  <b>
                    {Number(this.state.amountToSend).toFixed(3)} Dash
                  </b> to <b>{this.state.sendToName}!</b>
                </Alert>
              </>
            ) : (
              <></>
            )}

            {this.state.sendFailure ? (
              <>
                <p></p>
                <Alert variant="danger" dismissible>
                  <Alert.Heading>Payment Failed</Alert.Heading>
                  <p>
                    You have run into a platform error or a repeated transaction
                    error. If everything seems correct, please retry{" "}
                    <b>Verify Payment</b> to try again.
                  </p>
                </Alert>
              </>
            ) : (
              <></>
            )}

            {!this.state.isLoading &&
            this.state.identity !== "No Identity" &&
            this.state.uniqueName !== "Er" &&
            this.state.accountBalance !== 0 ? (
              <BottomNav
                handleLoginforRefreshWallet={this.handleLoginforRefreshWallet}
                dgmDocuments={this.state.dgmDocuments}
                isLoadingButtons={this.state.isLoadingButtons}
                closeExpandedNavs={this.closeExpandedNavs}
                handleGetDocsandGetIdInfo={this.handleGetDocsandGetIdInfo}
                
                mode={this.state.mode}
                showModal={this.showModal}
              />
            ) : (
              <></>
            )}

              {!this.state.isLoading ? <>
                <TxHistoryComponent
              mode={this.state.mode}
              accountHistory={this.state.accountHistory}
              accountBalance={this.state.accountBalance}
            />

            <PaymentAddrComponent
              mode={this.state.mode}
              accountAddress={this.state.accountAddress}
            />
              </>:
              <></>}
            

            <Footer />
          </>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "LoginSignupModal" ? (
          <LoginSignupModal
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            handleLoginwithMnem={this.handleLoginwithMnem}
            closeExpandedNavs={this.closeExpandedNavs}
          />
        ) : (
          <></>
        )}
        {this.state.isModalShowing &&
        this.state.presentModal === "ConfirmPaymentModal" ? (
          <ConfirmPaymentModal
            sendToName={this.state.sendToName}
            amountToSend={this.state.amountToSend}
            sendDashtoName={this.sendDashtoName}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            closeExpandedNavs={this.closeExpandedNavs}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "LogoutModal" ? (
          <LogoutModal
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            handleLogout={this.handleLogout}
            closeExpandedNavs={this.closeExpandedNavs}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "RegisterDGMModal" ? (
          <RegisterDGMModal
            RegisterDGMAddress={this.RegisterDGMAddress}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            closeExpandedNavs={this.closeExpandedNavs}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "TopUpIdentityModal" ? (
          <TopUpIdentityModal
            triggerTopUpEndLoadingsAfterFail={
              this.triggerTopUpEndLoadingsAfterFail
            }
            triggerTopUpLoading={this.triggerTopUpLoading}
            updateCreditsAfterTopUp={this.updateCreditsAfterTopUp}
            mnemonic={this.state.mnemonic}
            whichNetwork={this.state.whichNetwork}
            skipSynchronizationBeforeHeight={
              this.state.skipSynchronizationBeforeHeight
            }
            identity={this.state.identity}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            closeExpandedNavs={this.closeExpandedNavs}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default App;
