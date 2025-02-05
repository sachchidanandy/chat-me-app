import { useContext } from "react";
import { FriendsContext } from "../contextProvider/FriendsProvider";

const useFriends = () => (useContext(FriendsContext));

export default useFriends;
