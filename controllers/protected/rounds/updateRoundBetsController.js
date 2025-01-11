import Joi from 'joi';
import { updateRoundTransaction } from '../../discBaboonUserDataBaseDynamo.js';

const updateRoundBetsController = async (req, res) => {
    const baboonid = req.jwt.id;

    const {
        baboontype, gamesPlayed, otherBaboons,
    } = req.body;

    const gameResultSchema = Joi.object().pattern(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(_money)?$/,
        Joi.number().required()
    );

    const sideBetBaboonSchema = Joi.object({
        baboonId: Joi.string().required(),
        baboonUsername: Joi.string().required(),
    });

    const sideBetDetailsSchema = Joi.object({
        hole: Joi.number().allow(null).required(),
        winnerUsername: Joi.string(),
        sideBetLabel: Joi.string().required(),
        winnerId: Joi.string(),
        sideBetAmount: Joi.number().required(),
        sideBetBaboons: Joi.array().items(sideBetBaboonSchema).required(),
        typeOfSideBet: Joi.string().required(),
        status: Joi.string().required(),
    });

    const gamePlayedSchema = Joi.object({
        results: gameResultSchema.required(),
        game: Joi.string().required(),
        details: Joi.array().items(sideBetDetailsSchema).optional(),
    });

    const otherBaboonSchema = Joi.object({
        baboonFriendUsername: Joi.string().required(),
        baboonFriendId: Joi.string().required(),
    });

    const schema = Joi.object({
        baboontype: Joi.string().required(),
        dateOfBet: Joi.string().required(),
        otherBaboons: Joi.array().items(otherBaboonSchema).required(),
        gamesPlayed: Joi.array().items(gamePlayedSchema).required(),

    }).unknown(true);

    try {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const transactionData = [];
        const mainUserPayload = {
            Update: {
                TableName: "DiscBaboonUserData",
                Key: {
                    baboonid: baboonid,
                    baboontype: baboontype,
                },
                UpdateExpression: "set gamesPlayed = :gamesPlayed",
                ExpressionAttributeValues: {
                    ":gamesPlayed": gamesPlayed,
                },
                ReturnValues: "ALL_NEW",
            },
        };
        transactionData.push(mainUserPayload);

        otherBaboons.map((baboon) => {
            const additionalUsersPayload = {
                Update: {
                    TableName: "DiscBaboonUserData",
                    Key: {
                        baboonid: baboon.baboonFriendId,
                        baboontype: baboontype,
                    },
                    UpdateExpression: "set gamesPlayed = :gamesPlayed",
                    ExpressionAttributeValues: {
                        ":gamesPlayed": gamesPlayed,
                    },
                    ReturnValues: "ALL_NEW",
                },
            };
            transactionData.push(additionalUsersPayload);
        });

        await updateRoundTransaction(transactionData);
        return res.status(200).json({ message: 'Bet update success' });
    } catch {
        return res.status(500).json({ message: 'Error updating bets' });
    }
};

export default updateRoundBetsController;
