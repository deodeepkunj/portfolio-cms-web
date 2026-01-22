// File: `src/app/api/profile/route.ts`
import {NextRequest, NextResponse} from "next/server";
import {getUserFromToken} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import User from "@/app/api/models/User";

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();

        // get user from token in the request (ensure your implementation accepts req)
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({message: "Unauthenticated"}, {status: 401});
        }

        const body = await req.json();
        const {section, data} = body ?? {};

        if (!section || !data || typeof data !== "object") {
            return NextResponse.json(
                {message: "Section and data are required"},
                {status: 400}
            );
        }

        // build update object depending on section
        const updateQuery: Record<string, any> = {};

        switch (section) {
            case "header":
                // expected data: { firstName, lastName, designation, location, socials }
                if (data.firstName != null) updateQuery.firstName = data.firstName;
                if (data.lastName != null) updateQuery.lastName = data.lastName;
                if (data.designation != null) updateQuery.designation = data.designation;
                if (data.location != null) updateQuery["header.location"] = data.location;
                if (data.socials != null) updateQuery["header.socials"] = data.socials;
                break;

            case "personal":
                // expected data: { email, phone, bio }
                if (data.email != null) updateQuery.email = data.email;
                if (data.phone != null) updateQuery.phone = data.phone;
                if (data.bio != null) updateQuery.bio = data.bio;
                break;

            case "address":
                // expected data: { country, cityState, postalCode, taxId }
                if (data.country != null) updateQuery["address.country"] = data.country;
                if (data.cityState != null) updateQuery["address.cityState"] = data.cityState;
                if (data.postalCode != null) updateQuery["address.postalCode"] = data.postalCode;
                if (data.taxId != null) updateQuery["address.taxId"] = data.taxId;
                break;

            default:
                return NextResponse.json({message: "Invalid section"}, {status: 400});
        }

        if (Object.keys(updateQuery).length === 0) {
            return NextResponse.json(
                {message: "No valid fields provided to update"},
                {status: 400}
            );
        }
        const updatedUser = await User.findByIdAndUpdate(
            user.userId,
            {$set: updateQuery},
            {new: true, runValidators: true}
        ).lean();

        if (!updatedUser) {
            return NextResponse.json({message: "User not found"}, {status: 404});
        }

        return NextResponse.json({
            message: `${section} updated successfully`,
            user: updatedUser
        });
    } catch (err) {
        console.error("PATCH /api/profile error:", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500});
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const user = await getUserFromToken(req);
        if (!user?.userId) {
            return NextResponse.json({message: "Unauthenticated"}, {status: 401});
        }

        const dbUser = await User.findById(user.userId)
            .select("-password -__v")
            .lean();

        if (!dbUser) {
            return NextResponse.json({message: "User not found"}, {status: 404});
        }

        /**
         * UI-friendly response
         * Each block maps directly to a card with its own Edit button
         */
        const response = {
            header: {
                firstName: dbUser.firstName ?? "",
                lastName: dbUser.lastName ?? "",
                designation: dbUser.designation ?? "",
                location: dbUser.header?.location ?? "",
                socials: dbUser.header?.socials ?? {},
            },

            personal: {
                email: dbUser.email ?? "",
                phone: dbUser.phone ?? "",
                bio: dbUser.bio ?? "",
            },

            address: {
                country: dbUser.address?.country ?? "",
                cityState: dbUser.address?.cityState ?? "",
                postalCode: dbUser.address?.postalCode ?? "",
                taxId: dbUser.address?.taxId ?? "",
            },

            meta: {
                id: dbUser._id,
                createdAt: dbUser.createdAt,
                updatedAt: dbUser.updatedAt,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("GET /api/profile error:", error);
        return NextResponse.json(
            {message: "Internal server error"},
            {status: 500}
        );
    }
}