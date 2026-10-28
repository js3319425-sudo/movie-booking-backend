
const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const toTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const checkShowTime = async ({
    db,
    theatreId,
    screenId,
    show_date,
    start_time,
    movieDuration,
    excludeShowId = null
}) => {
    const requestedStart = toMinutes(start_time);
    const requestedEnd = requestedStart + Number(movieDuration);

    if (requestedEnd > 1440) {
        return {
            conflict: true,
            message: "Show cannot end after midnight"
        };
    }

    const end_time = toTime(requestedEnd);
    const bufferMinutes = 15;

    const query = {
        theatre_id: theatreId,
        screen_id: screenId,
        show_date,
        status: 1
    };

    // Update ke time current show ko ignore karo
    if (excludeShowId) {
        query._id = { $ne: excludeShowId };
    }

    const existingShows = await db.collection("show")
        .find(query)
        .sort({ start_time: 1 })
        .toArray();

    let candidateStart = requestedStart;

    for (const show of existingShows) {
        const existingStart = toMinutes(show.start_time);
        const existingEnd = toMinutes(show.end_time);

        // Kya requested duration existing show se pehle fit hoti hai?
        if (
            candidateStart + Number(movieDuration) + bufferMinutes
            <= existingStart
        ) {
            break;
        }

        // Agar conflict hai, candidate ko aage shift karo
        if (candidateStart < existingEnd + bufferMinutes) {
            candidateStart = existingEnd + bufferMinutes;
        }
    }

    const conflict = existingShows.find((show) => {
        const existingStart = toMinutes(show.start_time);
        const existingEnd = toMinutes(show.end_time);

        return (
            requestedStart < existingEnd + bufferMinutes &&
            requestedEnd + bufferMinutes > existingStart
        );
    });

    if (conflict) {
        const suggestedEnd = candidateStart + Number(movieDuration);

        return {
            conflict: true,
            message: "Show time conflicts with an existing show",
            end_time,
            conflictingShow: {
                start_time: conflict.start_time,
                end_time: conflict.end_time
            },
            next_available_start_time:
                suggestedEnd <= 1440 ? toTime(candidateStart) : null,
            next_available_end_time:
                suggestedEnd <= 1440 ? toTime(suggestedEnd) : null
        };
    }

    return {
        conflict: false,
        end_time
    };
};

module.exports = { checkShowTime };
