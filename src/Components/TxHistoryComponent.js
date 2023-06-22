import React from "react";
import Button from "react-bootstrap/Button";

import "./TxHistoryComponent.css";

class TxHistoryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayHistory: false,
      copiedHistory: false,
    };
  }

  handleDisplayHistory = () => {
    if (this.state.displayHistory === false)
      this.setState({
        displayHistory: true,
      });
    else {
      this.setState({
        displayHistory: false,
      });
    }
  };

  handleSatsToDash = (sats) => {
    let dashAmt = sats / 100000000;
    let dashAmt2Display = dashAmt.toFixed(3);
    return dashAmt2Display;
  };

  handleTimeToDate = (timeObject) => {
    let date = new Date(timeObject);

    //let longFormDate= setTime(date);

    return date.toLocaleDateString();
  };

  render() {
    let buttonColor;

    if (this.props.mode === "primary") {
      buttonColor = "outline-dark";
    } else {
      buttonColor = "outline-light";
    }


    let balance = this.props.accountBalance;
    let balanceArr = [balance];

    for (let tx of this.props.accountHistory) {
      
      balance -= tx.satoshisBalanceImpact;
      balanceArr.push(balance);
      
    }
    balanceArr.pop();

    let transactions = this.props.accountHistory.map((tx, index) => {
      return (
        <tr key={index}>
          {tx.type === "received" ? (
            <td className="satBalImpactreceived">
             <b> {this.handleSatsToDash(tx.satoshisBalanceImpact)}</b>
            </td>
          ) : (
            <td className="satBalImpactsent">
              {this.handleSatsToDash(tx.satoshisBalanceImpact)}
            </td>
          )}
          {tx.type === "received" ? (
            
            <td><b>{this.handleSatsToDash(balanceArr[index])}</b></td>
          ) : (
            
            <td>{this.handleSatsToDash(balanceArr[index])}</td>
          )}


          <td>{this.handleTimeToDate(tx.time)}</td>
        </tr>
      );
    });

    return (
      <>
        <div id="bodytext">
          <div className="positionButton">
            <Button
              variant={buttonColor}
              onClick={() => {
                this.handleDisplayHistory();
              }}
            >
              <h4>Your Transaction History</h4>
            </Button>
          </div>

          {this.state.displayHistory ? (
            <>
              <p></p>
              <div className="indentStuff">
                <p></p>
                <table className="txHistory">
                  <tr>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th id="rowWider">Date</th>
                  </tr>
                  {transactions}
                </table>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  }
}
export default TxHistoryComponent;
