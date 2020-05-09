import styled, { css } from "styled-components";

const baseButtonStyles = css`
    border: none;
    font: inherit;
    cursor: pointer;

    display: block;

    box-sizing: border-box;

    padding: 10px;
    border-radius: 50%;

    background-color: #d3d3d3;
    color: #fafafa;

    box-shadow: rgba(0, 0, 0, 0.2) 0 2px 2px;

    &:hover,
    &:focus {
        outline: none;
        background-color: #c4c4c4;
    }

    &:active {
        outline: none;
        box-shadow: rgba(0, 0, 0, 0.2) 0 2px 2px inset;
    }
`;

export const Button = styled.button`
    ${baseButtonStyles}
`;
export const LinkButton = styled.a`
    ${baseButtonStyles}
`;

export default Button;
