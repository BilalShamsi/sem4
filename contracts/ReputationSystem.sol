// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReputationSystem {
    struct Rating {
        address rater;
        uint8 score;
        string comment;
        uint256 timestamp;
    }

    struct Colleague {
        string name;
        address wallet;
    }

    mapping(address => Rating[]) public receivedRatings;
    mapping(address => mapping(address => bool)) public hasRated;
    mapping(address => string) public colleagueNames;
    address[] public colleagueAddresses;

    event UserRated(address indexed rater, address indexed ratee, uint8 score, string comment, uint256 timestamp);
    event ColleagueAdded(address indexed wallet, string name);

    // 🟢 No admin-only restriction here
    function addColleague(address wallet, string memory name) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(wallet != address(0), "Invalid wallet address");
        require(bytes(colleagueNames[wallet]).length == 0, "Colleague already exists");

        colleagueNames[wallet] = name;
        colleagueAddresses.push(wallet);

        emit ColleagueAdded(wallet, name);
    }

    function getAllColleagues() public view returns (Colleague[] memory) {
        Colleague[] memory list = new Colleague[](colleagueAddresses.length);
        for (uint256 i = 0; i < colleagueAddresses.length; i++) {
            address wallet = colleagueAddresses[i];
            list[i] = Colleague(colleagueNames[wallet], wallet);
        }
        return list;
    }

    function getColleagueName(address wallet) public view returns (string memory) {
        return colleagueNames[wallet];
    }

    function rateUser(address to, uint8 score, string memory comment) public {
        require(to != msg.sender, "You cannot rate yourself");
        require(bytes(colleagueNames[to]).length > 0, "User not a valid colleague");
        require(!hasRated[msg.sender][to], "You have already rated this colleague");
        require(score >= 1 && score <= 5, "Score must be between 1 and 5");

        receivedRatings[to].push(Rating(msg.sender, score, comment, block.timestamp));
        hasRated[msg.sender][to] = true;

        emit UserRated(msg.sender, to, score, comment, block.timestamp);
    }

    function getAllRatings(address user) public view returns (Rating[] memory) {
        return receivedRatings[user];
    }

    function getAverageScore(address user) public view returns (uint256) {
        Rating[] memory ratings = receivedRatings[user];
        if (ratings.length == 0) return 0;

        uint256 total = 0;
        for (uint256 i = 0; i < ratings.length; i++) {
            total += ratings[i].score;
        }
        return total / ratings.length;
    }
}
