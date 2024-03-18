/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";

// Define a schema for the "Color" trait
const colorTraitSchema = z.object({
  trait_type: z.literal("Color"),
  value: z.string(),
});

export type ColorTraitSchema = z.infer<typeof colorTraitSchema>;

// Define a schema for the NFT metadata
const nftMetadataSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    description: z.string(),
    image: z.string(),
    attributes: z.array(z.object({ trait_type: z.string(), value: z.string() })),
  })
  .superRefine((data, ctx) => {
    const colorTrait = data.attributes.find((attr): attr is ColorTraitSchema => attr.trait_type === "Color");

    if (!colorTrait) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"Color" trait is required.`,
      });
    }
  })
  .transform(data => {
    const colorTrait = data.attributes.find((attr): attr is ColorTraitSchema => attr.trait_type === "Color");

    return {
      ...data,
      color: colorTrait!.value,
      httpsImage: data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
    };
  });

export type NFTMetadata = z.infer<typeof nftMetadataSchema>;

const parseMetadata = (json: unknown) => {
  console.log(json);
  return nftMetadataSchema.parse(json);
};

export default parseMetadata;
