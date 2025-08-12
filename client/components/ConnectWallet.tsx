import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { supabase, generateUserId } from "@/lib/supabase";
import { toast } from "sonner";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnection(address);
    }
  }, [isConnected, address]);

  const handleWalletConnection = async (walletAddress: string) => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('wallet_address', walletAddress);
        
        toast.success(`Welcome back, ${existingUser.user_id}!`);
      } else {
        // Create new user
        const userId = generateUserId();
        const { error } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            user_id: userId,
            last_login: new Date().toISOString(),
          });

        if (error) {
          console.error('Error creating user:', error);
          toast.error('Failed to create user account');
        } else {
          toast.success(`Welcome! Your user ID is ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      toast.error('Failed to process wallet connection');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <ConnectButton 
        showBalance={false}
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    </div>
  );
}
