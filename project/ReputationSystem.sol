// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReputationSystem {
    struct Rating {
        address rater;
        uint8 score;
        string comment;
        uint256 timestamp;
    }

    mapping(address => Rating[]) public receivedRatings;
    mapping(address => mapping(address => bool)) public hasRated;
    address[] public users;

    event UserRated(address indexed rater, address indexed ratee, uint8 score, string comment, uint256 timestamp);

    modifier validRating(uint8 score) {
        require(score >= 1 && score <= 10, "Score must be between 1 and 10");
        _;
    }

    function rateUser(address _ratee, uint8 _score, string calldata _comment) external validRating(_score) {
        require(_ratee != msg.sender, "You cannot rate yourself");
        require(!hasRated[msg.sender][_ratee], "You have already rated this user");

        hasRated[msg.sender][_ratee] = true;

        receivedRatings[_ratee].push(Rating({
            rater: msg.sender,
            score: _score,
            comment: _comment,
            timestamp: block.timestamp
        }));

        if (!_userExists(_ratee)) {
            users.push(_ratee);
        }

        emit UserRated(msg.sender, _ratee, _score, _comment, block.timestamp);
    }

    function getAverageScore(address _user) public view returns (uint256 avgScore, uint256 totalRatings) {
        Rating[] memory ratings = receivedRatings[_user];
        uint256 sum = 0;

        for (uint256 i = 0; i < ratings.length; i++) {
            sum += ratings[i].score;
        }

        return (ratings.length > 0) ? (sum / ratings.length, ratings.length) : (0, 0);
    }

    function getAllRatings(address _user) public view returns (Rating[] memory) {
        return receivedRatings[_user];
    }

    function getAllUsers() public view returns (address[] memory) {
        return users;
    }

    function _userExists(address _user) internal view returns (bool) {
        for (uint i = 0; i < users.length; i++) {
            if (users[i] == _user) {
                return true;
            }
        }
        return false;
    }
}
