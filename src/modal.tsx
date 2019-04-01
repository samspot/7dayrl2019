import * as  React from "react"
import * as ReactDOM from "react-dom"

const ModalInner = () =>
    <div id="myModal" className="modal">
        <div className="modal-content">
            <span className="close">&times;</span>
            <p style={{ color: 'black' }} id="modal-text"></p>
        </div>
    </div>

function Modal(props: any) {
    console.log('Modal() called')
    return ReactDOM
        .createPortal(
            <ModalInner {...props} />,
            document.querySelector("#modaldiv")
        )
}

// TODO: This doesn't work at all - need to learn more react

export class ModalContainer {
    render() {
        return (
            <div>
                <Modal
                    content={this.renderContentProp()}
                    header="Foo"
                    actions={this.renderActionButtons()}
                    onDismiss={this.onDismiss}
                />
            </div>
        )
    }

    renderContentProp() {
        console.log('TODO modal content')
    }

    renderActionButtons() {
        return (
            <div>
                <div className="ui button primary">Delete</div>
                <div className="ui button">Cancel</div>
            </div>
        )
    }

    onDismiss() {
        let elem = document.querySelector('#modaldiv')
        // @ts-ignore
        elem.style.display = 'none'
    }

}


function code() {
    var modal = document.getElementById('myModal');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];


    // When the user clicks on <span> (x), close the modal
    // @ts-ignore
    span.onclick = function () {
        // @ts-ignore
        window.gameDisplay.hideModal()
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            // @ts-ignore
            window.gameDisplay.hideModal()
        }
    }
}