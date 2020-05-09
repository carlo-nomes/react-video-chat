import React, { FC } from "react";
import styled from "styled-components";
import { noop } from "lodash";

import useUserList from "../hooks/useUserList";

const UserListWrapper = styled.ul`
    position: absolute;
    top: 0;
    right: 0;
    z-index: 99999;

    background-color: rgba(0, 0, 0, 0.5);
    color: whitesmoke;

    margin: 25px;
    padding: 5px;

    display: block;
    flex-direction: column;
    align-items: stretch;
    > li {
        margin: 5px;
        padding: 5px;
        list-style: none;
        text-align: center;

        > button {
            width: 100%;
        }
    }
`;

type UserListProps = {
    onSelectUser?: (id: string) => void;
};
const UserList: FC<UserListProps> = ({ onSelectUser = noop }) => {
    const { me, otherUsers } = useUserList();

    return (
        <UserListWrapper>
            <li style={{ backgroundColor: "blue" }}>{me?.nickname}</li>
            {otherUsers.map((user) => (
                <li key={user.id}>
                    <button onClick={() => onSelectUser(user.id)}>{user.nickname}</button>
                </li>
            ))}
        </UserListWrapper>
    );
};

export default UserList;
