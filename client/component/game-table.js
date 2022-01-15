import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Col, Row, Grid } from 'react-native-easy-grid'
import SearchGameButton from './search-game-button.js'
import renderIf from 'render-if'

class GameTable extends React.Component {
    constructor({
        subscriber,
        moveHandler,
        searchHandler,
        isFirstTurn,
        opponent
    }) {
        super()

        this.subscriber = subscriber
        this.moveHandler = moveHandler
        this.searchHandler = searchHandler
        this.rows = [0, 1, 2];

        this.state = {
            map: new Map(),
            isMyTurn: isFirstTurn,
            isFirstTurn: isFirstTurn,
            isGameActive: true,
            opponent: opponent
        }

        this.handlers = {
            row: {
            },
            text: {
                style: (index) => {
                    return this.state.map.get(index)
                        ? styles.cross
                        : styles.zero
                },
                content: (index) => {
                    return this.state.map.has(index)
                        ? (this.state.map.get(index) ? 'X' : 'O')
                        : ''
                }
            }
        }
    }

    componentDidMount() {
        this.subscriber
            .on('gameStarted', (data) => {
                this.gameStart(data.opponent, data.isYourTurn)
            })
            .on('opponentMoved', (data) => {
                this.updateOponentMove(data.position)
            })
            .on('gameFinished', (data) => {
                this.finishGame(data.status)
            })
    }

    gameStart(opponent, isFirstTurn) {
        this.setState({
            map: new Map(),
            isMyTurn: isFirstTurn,
            isFirstTurn: isFirstTurn,
            isGameActive: true,
            opponent: opponent
        })
    }

    finishGame(result) {
        this.state.isMyTurn = false
        this.state.isGameActive = false
        this.state.prevGameResult = result
        this.setState(this.state)
    }

    updateFirstTurn(isFirstTurn) {
        this.state.isFirstTurn = isFirstTurn
        this.setState(this.state)
    }

    updateTurn(position) {
        if (this.state.isMyTurn && this.state.isGameActive && !this.state.map.has(position)) {
            const value = Number(this.state.isFirstTurn)
            this.state.isMyTurn = false
            this.state.map.set(position, value)

            this.moveHandler(position)
            this.setState(this.state)
        }
    }

    updateOponentMove(position) {
        this.state.map = this.state.map.set(position, Number(!this.state.isFirstTurn))
        this.state.isMyTurn = true
        this.setState(this.state)
    }

    updateMap(position, value) {
        this.state.map.set(position, value)
        this.setState(this.state)
    }

    getStatus() {
        if (this.state.isGameActive) {
            return this.state.isMyTurn ? 'Your turn' : ''
        }

        return <Text style={styles.resultText}>{this.state.prevGameResult}</Text>
    }

    getOpponent() {
        return this.state.opponent ? this.state.opponent : 'Dude'
    }

    render() {
        return (
            <View>
                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {'vs '}{this.getOpponent()}
                    </Text>
                    <Text style={[styles.headerText, styles.colored]}>
                        {this.getStatus()}
                    </Text>
                </View>
                <View style={styles.content} >
                    <Grid style={styles.table}>
                        {this.rows.map((col, a) => (
                            <Col key={a} style={styles.col}>
                                {this.rows.map((row, b) => (
                                    <Row
                                        key={b}
                                        style={styles.row}
                                        onPress={() => this.updateTurn(col * this.rows.length + row)}>
                                        <Text style={this.handlers.text.style(col * this.rows.length + row)}>
                                            {this.handlers.text.content(col * this.rows.length + row)}
                                        </Text>
                                    </Row>
                                ))}
                            </Col>
                        ))}
                    </Grid>
                </View>
                <View style={styles.footer}>
                    {renderIf(!this.state.isGameActive)(
                        <SearchGameButton style={styles.searchButton} handler={this.searchHandler} />
                    )}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    content: {
        overflow: 'hidden',
        marginVertical: 20,
        marginHorizontal: 20,
        maxWith: 400,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
    },
    headerText: {
        textAlign: 'center',
        color: 'lightgray',
        fontWeight: 'bold',
        fontSize: 20,
        height: 40,
        width: '50%'
    },
    resultText: {
        color: 'chocolate',
        textTransform: 'uppercase',
    },
    footer: {
        height: 60
    },
    table: {
        margin: -2,
        marginVertical: 20,
    },
    col: {},
    row: {
        margin: 0,
        height: 80,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
    },
    cross: {
        fontSize: 20,
        color: 'steelblue',
        fontWeight: 'bold',
    },
    zero: {
        fontSize: 20,
        color: 'chocolate',
        fontWeight: 'bold',
    },
    searchButton: {
        paddingTop: 20
    },
    colored: {
        color: 'steelblue',
    }
})

export default GameTable