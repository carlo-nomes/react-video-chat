import styled from "styled-components";

const ErrorMessage = styled.span`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 99999;

    border: 5px solid darkred;
    padding: 5px;
    margin: 5px;

    background-color: red;
    color: whitesmoke;
    text-align: center;
`;

export default ErrorMessage;
