// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint32, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract BlindStrategyGame is ZamaEthereumConfig {
    euint8 private _correct1;
    euint8 private _correct2;
    euint8 private _correct3;
    euint8 private _correct4;

    mapping(address player => bool joined) private _joined;
    mapping(address player => uint256 joinedAt) private _joinedAt;
    mapping(address player => bool submitted) private _submitted;

    mapping(address player => euint8 answer) private _answer1;
    mapping(address player => euint8 answer) private _answer2;
    mapping(address player => euint8 answer) private _answer3;
    mapping(address player => euint8 answer) private _answer4;

    mapping(address player => euint32 points) private _points;

    event PlayerJoined(address indexed player);
    event AnswersSubmitted(address indexed player);

    constructor() {
        _correct1 = FHE.asEuint8(1);
        _correct2 = FHE.asEuint8(2);
        _correct3 = FHE.asEuint8(3);
        _correct4 = FHE.asEuint8(4);

        FHE.allowThis(_correct1);
        FHE.allowThis(_correct2);
        FHE.allowThis(_correct3);
        FHE.allowThis(_correct4);
    }

    function joinGame() external {
        address player = msg.sender;
        require(!_joined[player], "Already joined");

        _joined[player] = true;
        _joinedAt[player] = block.timestamp;

        _points[player] = FHE.asEuint32(0);
        FHE.allowThis(_points[player]);
        FHE.allow(_points[player], player);

        emit PlayerJoined(player);
    }

    function submitAnswers(
        externalEuint8 a1,
        externalEuint8 a2,
        externalEuint8 a3,
        externalEuint8 a4,
        bytes calldata inputProof
    ) external {
        address player = msg.sender;
        require(_joined[player], "Player not joined");
        require(!_submitted[player], "Already submitted");

        euint8 ans1 = FHE.fromExternal(a1, inputProof);
        euint8 ans2 = FHE.fromExternal(a2, inputProof);
        euint8 ans3 = FHE.fromExternal(a3, inputProof);
        euint8 ans4 = FHE.fromExternal(a4, inputProof);

        _answer1[player] = ans1;
        _answer2[player] = ans2;
        _answer3[player] = ans3;
        _answer4[player] = ans4;

        ebool c1 = FHE.eq(ans1, _correct1);
        ebool c2 = FHE.eq(ans2, _correct2);
        ebool c3 = FHE.eq(ans3, _correct3);
        ebool c4 = FHE.eq(ans4, _correct4);

        ebool allCorrect = FHE.and(FHE.and(c1, c2), FHE.and(c3, c4));

        euint32 currentPoints = _points[player];
        euint32 rewardedPoints = FHE.add(currentPoints, FHE.asEuint32(100));
        _points[player] = FHE.select(allCorrect, rewardedPoints, currentPoints);

        _submitted[player] = true;

        FHE.allowThis(_answer1[player]);
        FHE.allowThis(_answer2[player]);
        FHE.allowThis(_answer3[player]);
        FHE.allowThis(_answer4[player]);
        FHE.allowThis(_points[player]);

        FHE.allow(_answer1[player], player);
        FHE.allow(_answer2[player], player);
        FHE.allow(_answer3[player], player);
        FHE.allow(_answer4[player], player);
        FHE.allow(_points[player], player);

        emit AnswersSubmitted(player);
    }

    function hasJoined(address player) external view returns (bool) {
        return _joined[player];
    }

    function joinedAt(address player) external view returns (uint256) {
        return _joinedAt[player];
    }

    function hasSubmitted(address player) external view returns (bool) {
        return _submitted[player];
    }

    function getEncryptedAnswers(address player) external view returns (euint8, euint8, euint8, euint8) {
        return (_answer1[player], _answer2[player], _answer3[player], _answer4[player]);
    }

    function getEncryptedPoints(address player) external view returns (euint32) {
        return _points[player];
    }
}
