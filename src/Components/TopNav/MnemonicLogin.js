import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

class MnemonicLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      searchedName: "",
      validated: true,
      validityCheck: false,
    };
  }

  handleCloseClick = () => {
    this.props.hideModal();
  };

  onChange = (event) => {
    //console.log(event.target.value);
    if (this.formValidate(event.target.value) === true) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({
        validityCheck: true,
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
      this.setState({
        validityCheck: false,
      });
    }
  };

  handleSubmitClick = (event) => {
    event.preventDefault();
    if (this.formValidate(event.target.validationCustom01.value)) {

      this.props.handleLoginwithMnem(event.target.validationCustom01.value);

      this.props.closeExpandedNavs();
      this.props.hideModal();
    } else {
      console.log(`Invalid Mnemonic: ${event.target.validationCustom01.value}`);
    }
  };

  formValidate = (mnemonic) => {
    let regex = /^([a-z]+[ ]){11}[a-z]+$/m;
    let valid = regex.test(mnemonic);

    if (valid) {
      this.setState({
        searchedName: mnemonic,
      });
      return true;
    } else {
      return false;
    }
  };

  render() {
    return (
      <>
        <Form
          noValidate
          onSubmit={this.handleSubmitClick}
          onChange={this.onChange}
        >
          <Form.Group className="mb-3" controlId="validationCustom01">
            {/* <Form.Label>Log in/Sign up with Wallet Mnemonic</Form.Label> */}
            <Form.Control
              type="text"
              placeholder="Enter Mnemonic (12 word passphrase) here..."
              required
              isInvalid={!this.state.validityCheck}
              isValid={this.state.validityCheck}
            />

            <Form.Control.Feedback type="invalid">
              Please provide valid mnemonic
            </Form.Control.Feedback>

            <Form.Control.Feedback type="valid">
              Mnemonic looks good, so long as everything is spelled correctly.
            </Form.Control.Feedback>

            <p></p>

            {/* <Form.Text className="text-muted"> */}
            
              <ul>
              <li>
                  Signing in will query Dash's Network for your Identity and your Wallet's balance.  
                </li>
                <li>
                  Additionally, it will verify your DashGetMoney Data Contract Document that enables the "Pay to Name" functionality. If this is your first time, just <b>Register Name</b> for Pay to Name functionality!
                </li>

                
              </ul>
            
            {this.state.validityCheck && !this.state.isLoading ? (
                <>
                  <p> </p>
                  <Button variant="primary" type="submit">
                    Connect Wallet
                  </Button>
                </>
              ) : (
                <Button disabled variant="primary" type="submit">
                  Connect Wallet
                </Button>
              )}
          </Form.Group>
          

          {/* <Button variant="primary" type="submit">
            Login with Mnemonic
          </Button> */}
        </Form>
      </>
    );
  }
}

export default MnemonicLogin;
