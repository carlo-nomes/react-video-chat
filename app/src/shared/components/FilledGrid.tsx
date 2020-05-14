import styled from "styled-components";

type FilledGridProps = {
    columns?: number;
    rows?: number;
};

const FilledGrid = styled.div<FilledGridProps>`
    position: absolute;
    width: 100vw;
    height: 100vh;

    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: stretch;

    > * {
        flex: 1;
        width: calc(100% / ${({ columns = 1 }) => columns});
        height: calc(100% / ${({ rows = 1 }) => rows});
    }
`;

export default FilledGrid;
