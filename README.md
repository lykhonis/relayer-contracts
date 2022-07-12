## Setup

```shell
yarn
```

## Usage

```shell
yarn clean
yarn dev
yarn test
yarn lint
```

#### Gas Reporting

```shell
REPORT_GAS=1 yarn test
```

#### Testing

Requires 2 terminal sessions:

```shell
yarn dev
```

```shell
yarn deploy
```

#### Deployment

```shell
yarn deploy --network [network name]
```

Supported networks:

| name | description |
| ---- | ----------- |
| local | Locally run node: `yarn dev` |
| l14 | Lukso L14 test network |
| l16 | Lukso L16 test network |

##### Configuration

```.env```:
```
OWNER_KEY=[Owner-Private-Key]
```

## Deployments

| network | contract | address |
| ---- | ----------- | ------- |
| l16 | RelayContractor | TBD |
