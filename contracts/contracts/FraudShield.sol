// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FraudShield
 * @dev Records AI-generated risk assessments on-chain for transparent audit trail.
 *      This contract does NOT hold user funds — it is purely an audit/logging contract.
 */
contract FraudShield {
    // ── Structs ──────────────────────────────────────────────────────────
    struct RiskAssessment {
        string txId;
        address sender;
        address recipient;
        uint8 riskScore;       // 0–100
        string riskLevel;      // "Low", "Medium", "High"
        string action;         // "Allow", "Warn", "Hold"
        uint256 timestamp;
        bool exists;
    }

    // ── State ────────────────────────────────────────────────────────────
    address public owner;
    mapping(string => RiskAssessment) private assessments;
    string[] private assessmentIds;

    // ── Events ───────────────────────────────────────────────────────────
    event RiskAssessmentRecorded(
        string indexed txId,
        address sender,
        address recipient,
        uint8 riskScore,
        string riskLevel,
        string action,
        uint256 timestamp
    );

    // ── Constructor ──────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── Public Functions ─────────────────────────────────────────────────

    /**
     * @dev Records a new risk assessment on-chain.
     * @param _txId      Unique transaction identifier
     * @param _sender    Sender wallet address
     * @param _recipient Recipient wallet address
     * @param _riskScore Risk score from 0 to 100
     * @param _riskLevel Human-readable risk level
     * @param _action    Recommended security action
     */
    function recordRiskAssessment(
        string memory _txId,
        address _sender,
        address _recipient,
        uint8 _riskScore,
        string memory _riskLevel,
        string memory _action
    ) public {
        require(_riskScore <= 100, "Risk score must be 0-100");
        require(!assessments[_txId].exists, "Assessment already recorded");

        RiskAssessment memory assessment = RiskAssessment({
            txId: _txId,
            sender: _sender,
            recipient: _recipient,
            riskScore: _riskScore,
            riskLevel: _riskLevel,
            action: _action,
            timestamp: block.timestamp,
            exists: true
        });

        assessments[_txId] = assessment;
        assessmentIds.push(_txId);

        emit RiskAssessmentRecorded(
            _txId,
            _sender,
            _recipient,
            _riskScore,
            _riskLevel,
            _action,
            block.timestamp
        );
    }

    /**
     * @dev Retrieves a risk assessment by transaction ID.
     */
    function getRiskAssessment(string memory _txId)
        public
        view
        returns (
            string memory txId,
            address sender,
            address recipient,
            uint8 riskScore,
            string memory riskLevel,
            string memory action,
            uint256 timestamp
        )
    {
        require(assessments[_txId].exists, "Assessment not found");
        RiskAssessment memory a = assessments[_txId];
        return (a.txId, a.sender, a.recipient, a.riskScore, a.riskLevel, a.action, a.timestamp);
    }

    /**
     * @dev Returns the total number of recorded assessments.
     */
    function getAssessmentCount() public view returns (uint256) {
        return assessmentIds.length;
    }

    /**
     * @dev Returns the transaction ID at a given index.
     */
    function getAssessmentIdAtIndex(uint256 _index)
        public
        view
        returns (string memory)
    {
        require(_index < assessmentIds.length, "Index out of bounds");
        return assessmentIds[_index];
    }
}
