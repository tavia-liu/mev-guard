// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MEVAttestation
/// @notice On-chain attestation for MEV attack detection results
/// @dev Deployed on Base for low-cost attestations
contract MEVAttestation {
    struct Attestation {
        address wallet;
        uint256 totalScanned;
        uint256 attacksFound;
        uint256 timestamp;
        bytes32 reportHash;
    }

    mapping(address => Attestation[]) public attestations;
    mapping(bytes32 => bool) public reportExists;
    
    uint256 public totalAttestations;
    
    event AttestationCreated(
        address indexed wallet,
        uint256 totalScanned,
        uint256 attacksFound,
        bytes32 reportHash,
        uint256 timestamp
    );

    /// @notice Create an attestation for a wallet scan
    /// @param wallet The scanned wallet address
    /// @param totalScanned Number of transactions scanned
    /// @param attacksFound Number of MEV attacks detected
    /// @param reportHash IPFS hash or hash of the full report
    function attest(
        address wallet,
        uint256 totalScanned,
        uint256 attacksFound,
        bytes32 reportHash
    ) external {
        require(!reportExists[reportHash], "Report already attested");
        
        Attestation memory newAttestation = Attestation({
            wallet: wallet,
            totalScanned: totalScanned,
            attacksFound: attacksFound,
            timestamp: block.timestamp,
            reportHash: reportHash
        });
        
        attestations[wallet].push(newAttestation);
        reportExists[reportHash] = true;
        totalAttestations++;
        
        emit AttestationCreated(
            wallet,
            totalScanned,
            attacksFound,
            reportHash,
            block.timestamp
        );
    }

    /// @notice Get all attestations for a wallet
    function getAttestations(address wallet) external view returns (Attestation[] memory) {
        return attestations[wallet];
    }

    /// @notice Get the latest attestation for a wallet
    function getLatestAttestation(address wallet) external view returns (Attestation memory) {
        require(attestations[wallet].length > 0, "No attestations");
        return attestations[wallet][attestations[wallet].length - 1];
    }

    /// @notice Get attestation count for a wallet
    function getAttestationCount(address wallet) external view returns (uint256) {
        return attestations[wallet].length;
    }
}
