# week4Dapp

# Create a voting dApp to cast votes, delegate, and query results on-chain

## Request Tokens 

### Tx hash : 0x3a1de6db2b2b867095e8fd445ec0beb6e994e80bcc0e37347a534d20af0d7ea6

```

function RequestTokens() {
  const { data: signer } = useSigner();
  const [txData, setTxData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleButtonClick = () => {
    requestTokens(signer, setLoading, setTxData);
  }

  if (txData) return (
    <div>
      <p>Transaction completed!</p>
      <a href={"https://sepolia.etherscan.io/tx/" + txData.hash} target="_blank">{txData.hash}</a>
    </div>
  );
  if (isLoading) return <p>Requesting tokens to be minted...</p>;

  return (
    <div>
      <h1>Request tokens to be minted</h1>
      <button style={{outlineColor: 'primary'}} onClick={handleButtonClick}>Request tokens</button>
    </div>
  );
}

async function requestTokens(signer, setLoading, setTxData) {
  setLoading(true);

  const message = "Some message";
  const signature = await signer.signMessage(message);

  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({address: signer._address, signature: signature})
  };

  fetch('http://localhost:3001/request-tokens', requestOptions)
    .then(response => response.json())
    .then((data) => {
      setTxData(data);
      setLoading(false);
    });
}
```
## Vote

### Tx hash: 0x5c622cfda825a643b941542a7dbb3b8066f5cf2c66688cf1481d67451110366d

```
function Vote({ proposalId, proposalName }) {
  const { data: signer } = useSigner();
  const [txData, setTxData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleVote = () => {
    vote(signer, proposalId, 1, setLoading, setTxData);
  }

  if (txData) return (
    <div>
      <p>Transaction completed!</p>
      <a href={`https://sepolia.etherscan.io/tx/${txData.hash}`} target="_blank">{txData.hash}</a>
    </div>
  );
  if (isLoading) return <p>Voting...</p>;

  return (
    <div>
      <h1>Cast vote to {proposalName}</h1>
      <button onClick={handleVote}>Cast vote</button>
    </div>
  );
}

async function vote(signer, proposal, amount, setLoading, setTxData) {
  setLoading(true);
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({address: signer._address, proposal: proposal, amount: amount})
  };

  fetch('http://localhost:3001/vote', requestOptions)
    .then(response => response.json())
    .then((data) => {
      setTxData(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error during the vote:', error);
      setLoading(false);
    });
}
```

## View Results 

```
// components/InstructionsComponent.jsx

function ViewVotes() {
  const { data: signer } = useSigner();
  const [votesData, setVotesData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleButtonClick = () => {
    fetchVotes(signer._address, setLoading, setVotesData);
  }

  if (votesData) return (
    <div>
      <p>Votes balance of the account: {votesData}</p>
    </div>
  );
  if (isLoading) return <p>Requesting votes...</p>;

  return (
    <div>
      <h1>Request account's votes</h1>
      <button onClick={handleButtonClick}>Request account's votes</button>
    </div>
  );
}

function fetchVotes(address, setLoading, setVotesData) {
  setLoading(true);
  const requestOptions = {
    method: 'GET',
    headers: {'Content-Type':'application/json'}
  };

  fetch('http://localhost:3001/api/vote', requestOptions)
    .then(response => response.json())
    .then((data) => {
      setVotesData(data);
      setLoading(false);
    })
    .catch(error => console.error('Error:', error));
}

function ViewProposals() {
  const [proposals, setProposals] = useState(null);

  useEffect(() => {
    fetchProposals(setProposals);
  }, []);

  if (!proposals) return <p>Loading proposals...</p>;

  return (
    <div>
      <h2>Current Proposals:</h2>
      {proposals.map((proposal, index) => (
        <p key={index}>
          Proposal {index + 1}: {proposal.name} (Votes: {proposal.voteCount})
        </p>
      ))}
    </div>
  );
}

function fetchProposals(setProposals) {
  fetch('http://localhost:3001/proposals')
    .then(response => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setProposals(data);
      } else {
        console.log("No proposals in response data");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
```

## Delegate 

### Smart contract was created so anyone with a valid ERC20Votes Token can vote. 

```
function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    _mint(to, amount);
    _delegate(to, to);
}

// The following functions are overrides required by Solidity.

function _afterTokenTransfer(address from, address to, uint256 amount)
    internal
    override(ERC20, ERC20Votes)
{
    super._afterTokenTransfer(from, to, amount);
    _delegate(to, to);
}

```







